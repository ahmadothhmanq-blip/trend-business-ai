import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listTriggers, createTrigger, fireTrigger } from "@/lib/agents/triggers";
import { logAgentAudit } from "@/lib/agents/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listTriggers(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("agents.triggers.list", error);
  return NextResponse.json({ triggers: data ?? [] });
}

const createSchema = z.object({
  name: z.string().min(1),
  triggerType: z.enum(["manual", "schedule", "webhook", "event", "api"]),
  agentId: z.string().uuid().optional(),
  workflowId: z.string().uuid().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const fireSchema = z.object({
  action: z.literal("fire"),
  triggerId: z.string().uuid(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const fire = fireSchema.safeParse(body);
  if (fire.success) {
    try {
      const result = await fireTrigger(auth.supabase, auth.user!.id, fire.data.triggerId, fire.data.payload ?? {});
      await logAgentAudit(auth.supabase, { user_id: auth.user!.id, action: "fire", entity_type: "trigger", entity_id: fire.data.triggerId });
      return NextResponse.json({ result });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
    }
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createTrigger(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    trigger_type: parsed.data.triggerType,
    agent_id: parsed.data.agentId ?? null,
    workflow_id: parsed.data.workflowId ?? null,
    config: parsed.data.config ?? {},
  });
  if (error) return databaseErrorResponse("agents.triggers.create", error);
  await logAgentAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "trigger", entity_id: data?.id });
  return NextResponse.json({ trigger: data });
}
