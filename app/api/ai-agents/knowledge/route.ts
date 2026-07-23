import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listKnowledgeBases, createKnowledgeBase, listDocuments, addDocument } from "@/lib/agents/knowledge";
import { logAgentAudit } from "@/lib/agents/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const kbId = new URL(request.url).searchParams.get("knowledgeBaseId");
  if (kbId) {
    const { data, error } = await listDocuments(auth.supabase, auth.user!.id, kbId);
    if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("agents.knowledge.docs", error);
    return NextResponse.json({ documents: data ?? [] });
  }
  const { data, error } = await listKnowledgeBases(auth.supabase, auth.user!.id);
  if (error && !/relation/i.test(error.message ?? "")) return databaseErrorResponse("agents.knowledge.list", error);
  return NextResponse.json({ knowledgeBases: data ?? [] });
}

const kbSchema = z.object({ name: z.string().min(1), description: z.string().optional(), agentId: z.string().uuid().optional() });
const docSchema = z.object({
  knowledgeBaseId: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().min(1),
  sourceType: z.string().default("text"),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const doc = docSchema.safeParse(body);
  if (doc.success) {
    const { data, error } = await addDocument(auth.supabase, {
      user_id: auth.user!.id,
      knowledge_base_id: doc.data.knowledgeBaseId,
      title: doc.data.title,
      content: doc.data.content,
      source_type: doc.data.sourceType,
    });
    if (error) return databaseErrorResponse("agents.knowledge.document", error);
    await logAgentAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "knowledge_document", entity_id: data?.id });
    return NextResponse.json({ document: data });
  }

  const parsed = kbSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createKnowledgeBase(auth.supabase, {
    user_id: auth.user!.id,
    name: parsed.data.name,
    description: parsed.data.description,
    agent_id: parsed.data.agentId ?? null,
  });
  if (error) return databaseErrorResponse("agents.knowledge.create", error);
  await logAgentAudit(auth.supabase, { user_id: auth.user!.id, action: "create", entity_type: "knowledge_base", entity_id: data?.id });
  return NextResponse.json({ knowledgeBase: data });
}
