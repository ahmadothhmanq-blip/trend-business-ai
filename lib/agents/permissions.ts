import type { SupabaseClient } from "@supabase/supabase-js";

export const AGENT_ROLE_PERMISSIONS = {
  owner: ["view", "run", "edit", "admin"],
  editor: ["view", "run", "edit"],
  runner: ["view", "run"],
  viewer: ["view"],
} as const;

export async function hasAgentPermission(
  supabase: SupabaseClient,
  userId: string,
  agentId: string,
  permission: "view" | "run" | "edit" | "admin",
): Promise<boolean> {
  const { data: agent } = await supabase.from("agents").select("user_id").eq("id", agentId).single();
  if (agent?.user_id === userId) return true;

  const { data: perms } = await supabase
    .from("agent_permissions")
    .select("permission")
    .eq("agent_id", agentId)
    .eq("principal_type", "user")
    .eq("principal_id", userId);

  const granted = (perms ?? []).map((p) => p.permission);
  if (granted.includes("admin")) return true;
  if (permission === "view") return granted.includes("view") || granted.includes("run") || granted.includes("edit");
  if (permission === "run") return granted.includes("run") || granted.includes("edit");
  if (permission === "edit") return granted.includes("edit");
  return false;
}
