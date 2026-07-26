/**
 * Load a webapp generation for platform services (ownership-scoped).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  extractAppModelFromBlueprint,
  extractVersionHistory,
} from "@/lib/ai-core/app-design-platform/management";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { WebAppBlueprint, WebAppGeneration } from "@/types/webapp";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export function toWebappPayload(generation: WebAppGeneration): {
  model: StructuredAppModel;
  files: GeneratedProjectFile[];
  blueprint: WebAppBlueprint;
} {
  const blueprint = (generation.blueprint || {
    title: generation.app_name,
    description: generation.description,
    appType: generation.app_type,
    framework: "next",
    pages: [],
    files: [],
    settings: {},
    prompt: generation.prompt,
    generatedAt: generation.created_at,
  }) as WebAppBlueprint;

  const model = extractAppModelFromBlueprint(blueprint, {
    prompt: generation.prompt,
    appType: generation.app_type,
    language: generation.language,
    designStyle: generation.design_style,
    colorStyle: generation.color_style,
    features: generation.features,
    appName: generation.app_name,
  });

  return {
    model,
    files: blueprint.files ?? [],
    blueprint,
  };
}

export async function loadWebappGenerationForUser(
  supabase: SupabaseClient,
  userId: string,
  generationId: string,
): Promise<WebAppGeneration | null> {
  const { data, error } = await supabase
    .from("webapp_generations")
    .select("*")
    .eq("id", generationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as WebAppGeneration | null) ?? null;
}

export { extractVersionHistory };
