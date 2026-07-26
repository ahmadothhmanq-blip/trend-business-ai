/**
 * Load a website generation for platform services (ownership-scoped).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { WebsiteGeneration } from "@/types/database";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import { resolveBuilderAccess } from "@/lib/website/builder/access";

export function toWebsiteProject(
  generation: WebsiteGeneration,
): GeneratedWebsiteProject {
  const blueprint = (generation.blueprint ||
    {}) as unknown as GeneratedWebsiteProject;
  const files = extractWebsiteFilesFromBlueprint(generation.blueprint);
  return {
    ...blueprint,
    projectKind: blueprint.projectKind || "website",
    title: blueprint.title || generation.project_name || "Website",
    description:
      blueprint.description || generation.business_description || "",
    pages: blueprint.pages || [],
    sections: blueprint.sections || [],
    colorPalette: blueprint.colorPalette || [],
    typography: blueprint.typography || [],
    components: blueprint.components || [],
    content: blueprint.content || [],
    seo: blueprint.seo || [],
    roadmap: blueprint.roadmap || [],
    files: files.length ? files : blueprint.files || [],
    businessProfile: blueprint.businessProfile,
    strategy: blueprint.strategy,
    designSystem: blueprint.designSystem,
    assetManifest: blueprint.assetManifest,
    seoPackage: blueprint.seoPackage,
    qualityReport: blueprint.qualityReport,
  };
}

export async function loadWebsiteGenerationForUser(
  supabase: SupabaseClient,
  userId: string,
  generationId: string,
): Promise<WebsiteGeneration | null> {
  const access = await resolveBuilderAccess(supabase, userId, generationId);
  if (!access) return null;

  const { data, error } = await supabase
    .from("website_generations")
    .select("*")
    .eq("id", generationId)
    .maybeSingle();

  if (error) throw error;
  return (data as WebsiteGeneration | null) ?? null;
}
