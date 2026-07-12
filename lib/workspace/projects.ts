import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project, WorkspaceType } from "@/types/database";

export async function ensureProjectForGeneration(
  supabase: SupabaseClient,
  params: {
    userId: string;
    productId?: string | null;
    workspaceType: WorkspaceType;
    name: string;
    projectId?: string | null;
  },
): Promise<Project | null> {
  if (params.projectId) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", params.projectId)
      .eq("user_id", params.userId)
      .maybeSingle();
    if (data) return data as Project;
  }

  // Reuse the most recent matching project for this product/workspace.
  let query = supabase
    .from("projects")
    .select("*")
    .eq("user_id", params.userId)
    .eq("workspace_type", params.workspaceType)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (params.productId) {
    query = query.eq("product_id", params.productId);
  }

  const { data: existing } = await query.maybeSingle();
  if (existing) {
    await supabase
      .from("projects")
      .update({
        name: params.name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (existing as Project).id);
    return existing as Project;
  }

  const { data: created, error } = await supabase
    .from("projects")
    .insert({
      user_id: params.userId,
      name: params.name,
      product_id: params.productId ?? null,
      workspace_type: params.workspaceType,
      description: null,
    })
    .select("*")
    .single();

  if (error || !created) {
    console.error("[projects] ensureProjectForGeneration failed:", error);
    return null;
  }

  return created as Project;
}
