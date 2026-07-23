import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listSchedules, createSchedule, executeDueSchedules } from "@/lib/agents/scheduler";
import { logAgentAudit } from "@/lib/agents/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listSchedules(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("agents.schedules.list", error);
  return NextResponse.json({ schedules: data ?? [] });
}

const createSchema = z.object({
  name: z.string().min(1),
  cronExpression: z.string().min(1),
  agentId: z.string().uuid().optional(),
  workflowId: z.string().uuid().optional(),
  input: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  if ((body as Record<string, unknown>).action === "execute-due") {
    const results = await executeDueSchedules(auth.supabase, auth.user!.id);
    return NextResponse.json({ results });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createSchedule(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    cron_expression: parsed.data.cronExpression,
    agent_id: parsed.data.agentId ?? null,
    workflow_id: parsed.data.workflowId ?? null,
    input: parsed.data.input ?? {},
  });
  if (error) return databaseErrorResponse("agents.schedules.create", error);
  await logAgentAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "schedule", entity_id: data?.id });
  return NextResponse.json({ schedule: data });
}
