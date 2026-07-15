import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { runAgent } from "@/lib/agent-runner";
import type { Agent, AgentExecution } from "@/types/agents";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const type = searchParams.get("type");
  const category = searchParams.get("category");

  let query = auth.supabase
    .from("agents")
    .select("*", { count: "exact" })
    .or(`user_id.eq.${auth.user!.id},is_template.eq.true`)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("agent_type", type);
  if (category) query = query.eq("category", category);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ agents: [], total: 0, page, limit, totalPages: 1 });
    return databaseErrorResponse("agents.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({ agents: data as Agent[], total, page, limit, totalPages: Math.ceil(total / limit) || 1 });
}

const createAgentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(2000).default(""),
  agentType: z.string().default("custom"),
  category: z.string().default("general"),
  systemPrompt: z.string().max(10000).default(""),
  tools: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(100).max(32000).default(4096),
  tags: z.array(z.string()).default([]),
});

const runAgentSchema = z.object({
  agentId: z.string().uuid().optional(),
  task: z.string().trim().min(1).max(5000),
  context: z.string().max(10000).optional(),
  maxSteps: z.number().int().min(1).max(12).default(6),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const action = (body as Record<string, unknown>).action;

  if (action === "create-agent") {
    const parsed = createAgentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

    const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
    const { data, error } = await auth.supabase.from("agents").insert({
      user_id: auth.user!.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      agent_type: parsed.data.agentType,
      category: parsed.data.category,
      system_prompt: parsed.data.systemPrompt,
      tools: parsed.data.tools,
      capabilities: parsed.data.capabilities,
      temperature: parsed.data.temperature,
      max_tokens: parsed.data.maxTokens,
      tags: parsed.data.tags,
    }).select("*").single();

    if (error) {
      if (error.code === "42P01") return NextResponse.json({ error: "Agents table not ready. Apply migration 022." }, { status: 503 });
      return databaseErrorResponse("agents.create", error);
    }
    return NextResponse.json({ agent: data as Agent, message: "Agent created." });
  }

  const parsed = runAgentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "ai-agents");
  if (rateLimited) return rateLimited;

  let agent: Agent | null = null;
  if (parsed.data.agentId) {
    const { data: a } = await auth.supabase.from("agents").select("*").eq("id", parsed.data.agentId).single();
    agent = a as Agent | null;
  }

  const systemPrompt = agent?.system_prompt ?? "You are a helpful AI agent. Complete the user's task thoroughly.";
  const tools = (agent?.tools ?? []) as string[];
  const agentType = agent?.agent_type ?? "custom";

  const startTime = Date.now();
  try {
    const result = await runAgent({
      task: parsed.data.task,
      agentType,
      systemPrompt,
      tools,
      context: parsed.data.context,
      maxSteps: parsed.data.maxSteps,
    });

    const execData = {
      user_id: auth.user!.id,
      agent_id: parsed.data.agentId ?? null,
      task_name: result.output.title || parsed.data.task.slice(0, 100),
      input: { task: parsed.data.task, context: parsed.data.context },
      output: result.output,
      steps_log: result.output.stepResults,
      status: "completed",
      provider: result.provider,
      token_usage: result.usage,
      execution_time_ms: result.generationTimeMs,
      completed_at: new Date().toISOString(),
    };

    const { data: exec, error: execErr } = await auth.supabase.from("agent_executions").insert(execData).select("*").single();
    if (execErr && execErr.code !== "42P01") {
      return NextResponse.json({ execution: execData, output: result.output, message: "Execution completed (not persisted)." });
    }

    if (agent) {
      await auth.supabase.from("agents").update({
        total_runs: (agent.total_runs ?? 0) + 1,
        total_tokens_used: (agent.total_tokens_used ?? 0) + (result.usage.totalTokens ?? 0),
        updated_at: new Date().toISOString(),
      }).eq("id", agent.id);
    }

    return NextResponse.json({ execution: exec as AgentExecution, output: result.output, message: "Agent task completed." });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    try {
      await auth.supabase.from("agent_executions").insert({
        user_id: auth.user!.id,
        agent_id: parsed.data.agentId ?? null,
        task_name: parsed.data.task.slice(0, 100),
        input: { task: parsed.data.task },
        status: "failed",
        error_message: errMsg,
        execution_time_ms: Date.now() - startTime,
      });
    } catch { /* best effort */ }
    return serverErrorResponse("agents.run", err);
  }
}
