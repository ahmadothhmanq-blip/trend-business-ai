import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { runWorkflow } from "@/lib/agents/workflows";
import { logAgentAudit } from "@/lib/agents/audit";
import type { AgentWorkflow } from "@/types/agents";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);

  const { data, error, count } = await auth.supabase
    .from("agent_workflows")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ workflows: [], total: 0, page, limit, totalPages: 1 });
    return databaseErrorResponse("workflows.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({ workflows: data as AgentWorkflow[], total, page, limit, totalPages: Math.ceil(total / limit) || 1 });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(2000).default(""),
  triggerType: z.enum(["manual", "schedule", "webhook", "event", "api"]).default("manual"),
  triggerConfig: z.record(z.string(), z.unknown()).default({}),
  steps: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["agent", "condition", "delay", "transform", "notification", "service"]),
    agent_id: z.string().optional(),
    service: z.string().optional(),
    config: z.record(z.string(), z.unknown()).default({}),
    input_mapping: z.record(z.string(), z.string()).default({}),
    output_key: z.string().default(""),
    on_error: z.enum(["stop", "skip", "retry"]).default("stop"),
    max_retries: z.number().int().min(0).max(5).default(0),
    position: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
    next_steps: z.array(z.string()).default([]),
  })).default([]),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const runBody = body as { action?: string; workflowId?: string; input?: Record<string, unknown> };
  if (runBody.action === "run" && runBody.workflowId) {
    try {
      const result = await runWorkflow(auth.supabase, auth.user!.id, runBody.workflowId, runBody.input ?? {});
      await logAgentAudit(auth.supabase, { user_id: auth.user!.id, action: "run", entity_type: "workflow", entity_id: runBody.workflowId });
      return NextResponse.json({ result });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
    }
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { data, error } = await auth.supabase.from("agent_workflows").insert({
    user_id: auth.user!.id,
    name: parsed.data.name,
    description: parsed.data.description,
    trigger_type: parsed.data.triggerType,
    trigger_config: parsed.data.triggerConfig,
    steps: parsed.data.steps,
  }).select("*").single();

  if (error) {
    if (error.code === "42P01") return NextResponse.json({ error: "Workflows table not ready. Apply migration 022." }, { status: 503 });
    return databaseErrorResponse("workflows.create", error);
  }
  await logAgentAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "workflow", entity_id: data?.id });
  return NextResponse.json({ workflow: data as AgentWorkflow, message: "Workflow created." });
}
