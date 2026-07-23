import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentKnowledgeBase, AgentKnowledgeDocument } from "@/types/agents-platform";

export async function listKnowledgeBases(supabase: SupabaseClient, userId: string) {
  return supabase.from("agent_knowledge_bases").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
}

export async function createKnowledgeBase(
  supabase: SupabaseClient,
  row: Partial<AgentKnowledgeBase> & { user_id: string; name: string },
) {
  return supabase.from("agent_knowledge_bases").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    agent_id: row.agent_id ?? null,
    name: row.name,
    description: row.description ?? "",
    indexing_status: "pending",
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function listDocuments(supabase: SupabaseClient, userId: string, knowledgeBaseId: string) {
  return supabase.from("agent_knowledge_documents").select("*").eq("user_id", userId).eq("knowledge_base_id", knowledgeBaseId).order("created_at", { ascending: false });
}

export async function addDocument(
  supabase: SupabaseClient,
  row: Partial<AgentKnowledgeDocument> & { user_id: string; knowledge_base_id: string; title: string; content: string },
) {
  const { data: doc, error } = await supabase.from("agent_knowledge_documents").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    knowledge_base_id: row.knowledge_base_id,
    title: row.title,
    content: row.content,
    source_type: row.source_type ?? "text",
    embedding_ready: false,
    metadata: row.metadata ?? {},
  }).select("*").single();

  if (!error && doc) {
    await supabase.from("agent_knowledge_bases").update({
      document_count: await countDocuments(supabase, row.user_id, row.knowledge_base_id),
      indexing_status: "ready",
      updated_at: new Date().toISOString(),
    }).eq("id", row.knowledge_base_id).eq("user_id", row.user_id);
  }
  return { data: doc, error };
}

async function countDocuments(supabase: SupabaseClient, userId: string, kbId: string) {
  const { count } = await supabase.from("agent_knowledge_documents").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("knowledge_base_id", kbId);
  return count ?? 0;
}

export async function loadKnowledgeContext(supabase: SupabaseClient, userId: string, agentId?: string): Promise<string[]> {
  if (!agentId) return [];
  const { data: bases } = await supabase.from("agent_knowledge_bases").select("id").eq("user_id", userId).eq("agent_id", agentId).limit(3);
  if (!bases?.length) return [];
  const ids = bases.map((b) => b.id);
  const { data: docs } = await supabase.from("agent_knowledge_documents").select("title, content").eq("user_id", userId).in("knowledge_base_id", ids).limit(10);
  return (docs ?? []).map((d) => `## ${d.title}\n${d.content.slice(0, 1500)}`);
}
