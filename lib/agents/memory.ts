import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentMemoryEntry } from "@/types/agents-platform";

export async function listMemory(supabase: SupabaseClient, userId: string, agentId?: string) {
  let q = supabase.from("agent_memory_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (agentId) q = q.eq("agent_id", agentId);
  return q.limit(100);
}

export async function saveMemory(
  supabase: SupabaseClient,
  row: Partial<AgentMemoryEntry> & { user_id: string; agent_id: string; content: string },
) {
  return supabase.from("agent_memory_entries").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    agent_id: row.agent_id,
    memory_type: row.memory_type ?? "context",
    key: row.key ?? "",
    content: row.content,
    relevance_score: row.relevance_score ?? 1,
    expires_at: row.expires_at ?? null,
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function updateMemory(supabase: SupabaseClient, userId: string, id: string, updates: Partial<AgentMemoryEntry>) {
  return supabase.from("agent_memory_entries").update({
    ...updates,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("user_id", userId).select("*").single();
}

export async function deleteMemory(supabase: SupabaseClient, userId: string, id: string) {
  return supabase.from("agent_memory_entries").delete().eq("id", id).eq("user_id", userId);
}

export async function loadMemoryForRun(supabase: SupabaseClient, userId: string, agentId?: string): Promise<string[]> {
  if (!agentId) return [];
  const { data } = await supabase
    .from("agent_memory_entries")
    .select("key, content, memory_type")
    .eq("user_id", userId)
    .eq("agent_id", agentId)
    .order("relevance_score", { ascending: false })
    .limit(20);
  return (data ?? []).map((m) => `[${m.memory_type}${m.key ? `:${m.key}` : ""}] ${m.content}`);
}
