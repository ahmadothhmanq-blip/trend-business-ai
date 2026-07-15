import type { SupabaseClient } from "@supabase/supabase-js";
import type { Organization } from "@/types/platform";

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "workspace"}-${suffix}`;
}

/**
 * Returns the user's primary organization, creating a personal workspace if none exists.
 */
export async function ensurePersonalOrganization(
  supabase: SupabaseClient,
  userId: string,
  displayName?: string | null,
): Promise<{ organization: Organization | null; error: string | null; created: boolean }> {
  const { data: memberships, error: memberError } = await supabase
    .from("org_members")
    .select("organization_id, organizations(*)")
    .eq("user_id", userId)
    .limit(1);

  if (memberError) {
    if (memberError.code === "42P01") {
      return { organization: null, error: "Organization tables not ready. Apply migrations 021 and 024.", created: false };
    }
    return { organization: null, error: memberError.message, created: false };
  }

  const existing = memberships?.[0] as
    | { organization_id: string; organizations: Organization | Organization[] | null }
    | undefined;

  if (existing?.organizations) {
    const org = Array.isArray(existing.organizations)
      ? existing.organizations[0]
      : existing.organizations;
    if (org) return { organization: org, error: null, created: false };
  }

  const name = (displayName?.trim() || "Personal Workspace").slice(0, 80);
  const slug = slugify(name);

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      slug,
      owner_id: userId,
      plan: "free",
    })
    .select("*")
    .single();

  if (orgError) {
    if (orgError.code === "42P01") {
      return { organization: null, error: "Organization tables not ready. Apply migrations 021 and 024.", created: false };
    }
    return { organization: null, error: orgError.message, created: false };
  }

  const { error: joinError } = await supabase.from("org_members").insert({
    organization_id: org.id,
    user_id: userId,
    role: "owner",
  });

  if (joinError) {
    return { organization: null, error: joinError.message, created: false };
  }

  return { organization: org as Organization, error: null, created: true };
}

export async function requireOrgAdmin(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from("org_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data || !["owner", "admin"].includes(data.role)) {
    return { ok: false, error: "Only organization owners and admins can manage the team." };
  }
  return { ok: true };
}
