import type { Team, Role } from "@/types/business-manager";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listTeams(
  supabase: SupabaseClient,
  userId: string,
  filters?: { organizationId?: string },
) {
  let query = supabase
    .from("business_teams")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (filters?.organizationId) query = query.eq("organization_id", filters.organizationId);
  return query;
}

export async function createTeam(
  supabase: SupabaseClient,
  row: Partial<Team> & { user_id: string; organization_id: string; name: string },
) {
  return supabase
    .from("business_teams")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id,
      department_id: row.department_id ?? null,
      name: row.name,
      description: row.description ?? "",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateTeam(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("business_teams")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}

export async function listRoles(
  supabase: SupabaseClient,
  userId: string,
  filters?: { organizationId?: string; teamId?: string },
) {
  let query = supabase
    .from("business_roles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (filters?.organizationId) query = query.eq("organization_id", filters.organizationId);
  if (filters?.teamId) query = query.eq("team_id", filters.teamId);
  return query;
}

export async function createRole(
  supabase: SupabaseClient,
  row: Partial<Role> & { user_id: string; organization_id: string; member_name: string },
) {
  return supabase
    .from("business_roles")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id,
      team_id: row.team_id ?? null,
      member_name: row.member_name,
      member_email: row.member_email ?? "",
      role_type: row.role_type ?? "member",
      permissions: row.permissions ?? [],
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateRole(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("business_roles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}
