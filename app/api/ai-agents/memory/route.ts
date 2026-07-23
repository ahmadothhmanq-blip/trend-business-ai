import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listMemory, saveMemory, updateMemory, deleteMemory } from "@/lib/agents/memory";
import { logAgentAudit } from "@/lib/agents/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const agentId = new URL(request.url).searchParams.get("agentId") ?? undefined;
  const { data, error } = await listMemory(auth.supabase, auth.user!.id, agentId);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("agents.memory.list", error);
  return NextResponse.json({ memories: data ?? [] });
}

const saveSchema = z.object({
  agentId: z.string().uuid(),
  memoryType: z.enum(["conversation", "fact", "context", "preference", "summary"]).default("context"),
  key: z.string().default(""),
  content: z.string().min(1),
  relevanceScore: z.number().min(0).max(1).optional(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  content: z.string().optional(),
  key: z.string().optional(),
  relevanceScore: z.number().min(0).max(1).optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const action = (body as Record<string, unknown>).action;
  if (action === "delete") {
    const id = String((body as Record<string, unknown>).id ?? "");
    const { error } = await deleteMemory(auth.supabase, auth.user!.id, id);
    if (error) return databaseErrorResponse("agents.memory.delete", error);
    await logAgentAudit(auth.supabase, { user_id: auth.user!.id, action: "delete", entity_type: "memory", entity_id: id });
    return NextResponse.json({ message: "Memory deleted." });
  }

  const upd = updateSchema.safeParse(body);
  if (upd.success) {
    const { data, error } = await updateMemory(auth.supabase, auth.user!.id, upd.data.id, {
      content: upd.data.content,
      key: upd.data.key,
      relevance_score: upd.data.relevanceScore,
    });
    if (error) return databaseErrorResponse("agents.memory.update", error);
    return NextResponse.json({ memory: data });
  }

  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await saveMemory(auth.supabase, {
    user_id: auth.user!.id,
    agent_id: parsed.data.agentId,
    memory_type: parsed.data.memoryType,
    key: parsed.data.key,
    content: parsed.data.content,
    relevance_score: parsed.data.relevanceScore,
  });
  if (error) return databaseErrorResponse("agents.memory.save", error);
  await logAgentAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "memory", entity_id: data?.id });
  return NextResponse.json({ memory: data });
}
