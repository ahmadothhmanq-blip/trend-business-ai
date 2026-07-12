import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceGeneration, WorkspaceType } from "@/types/database";
import type { PersistableGenerationFields } from "@/lib/workspace/persist";

type InsertParams = PersistableGenerationFields & {
  user_id: string;
  workspace_type: WorkspaceType;
};

/** Insert with Phase 5 columns; fall back to legacy columns if migration is pending. */
export async function insertWorkspaceGeneration(
  supabase: SupabaseClient,
  row: InsertParams,
): Promise<{ data: WorkspaceGeneration | null; error: { message: string } | null }> {
  const full = await supabase
    .from("workspace_generations")
    .insert(row)
    .select("*")
    .single();

  if (!full.error) {
    return { data: full.data as WorkspaceGeneration, error: null };
  }

  const message = full.error.message?.toLowerCase() ?? "";
  const missingColumn =
    message.includes("column") ||
    message.includes("schema cache") ||
    message.includes("does not exist");

  if (!missingColumn) {
    return { data: null, error: full.error };
  }

  const legacy = await supabase
    .from("workspace_generations")
    .insert({
      user_id: row.user_id,
      workspace_type: row.workspace_type,
      title: row.title,
      brief: row.brief,
      template: row.template,
      language: row.language,
      theme: row.theme,
      features: row.features,
      output: {
        ...row.output,
        tokenUsage: row.token_usage,
        generationTimeMs: row.generation_time_ms,
        mode: row.mode,
      },
      is_favorite: row.is_favorite ?? false,
    })
    .select("*")
    .single();

  return {
    data: (legacy.data as WorkspaceGeneration) ?? null,
    error: legacy.error,
  };
}
