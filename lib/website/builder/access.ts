/**
 * Website Builder — generation access checks (owner + collaborators).
 */

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  builderRoleCan,
  type BuilderMemberRole,
} from "@/lib/website/builder/enterprise";

export type BuilderAccessLevel = "owner" | BuilderMemberRole | null;

export async function resolveBuilderAccess(
  supabase: SupabaseClient,
  userId: string,
  generationId: string,
): Promise<BuilderAccessLevel> {
  const { data: generation } = await supabase
    .from("website_generations")
    .select("id")
    .eq("id", generationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (generation) return "owner";

  const { data: membership } = await supabase
    .from("website_generation_members")
    .select("role, status")
    .eq("generation_id", generationId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();

  if (membership?.role) {
    return membership.role as BuilderMemberRole;
  }

  return null;
}

export async function assertBuilderAccess(
  supabase: SupabaseClient,
  userId: string,
  generationId: string,
  action: "edit" | "publish" | "manage" | "invite",
): Promise<BuilderAccessLevel> {
  const access = await resolveBuilderAccess(supabase, userId, generationId);
  if (!access) return null;
  if (access === "owner") return access;
  if (builderRoleCan(access, action)) return access;
  return null;
}
