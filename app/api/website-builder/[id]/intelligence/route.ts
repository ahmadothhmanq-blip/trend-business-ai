import { NextResponse } from "next/server";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  runWebsiteIntelligence,
  runWebsitePerformanceUpgrade,
} from "@/lib/ai-core/website-design-platform";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET — Website Intelligence report (Phase 6) + performance snapshot (Phase 11).
 */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const { data: existing, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", parsedId.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const generation = existing as WebsiteGeneration;
  const blueprint = (generation.blueprint ||
    {}) as unknown as GeneratedWebsiteProject;
  const files = extractWebsiteFilesFromBlueprint(generation.blueprint);
  const project: GeneratedWebsiteProject = {
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
    performanceReport: blueprint.performanceReport,
  };

  const intelligence = runWebsiteIntelligence(project);
  const performance = runWebsitePerformanceUpgrade(project.files || []);

  return NextResponse.json({
    intelligence,
    performance,
    generationId: parsedId.id,
  });
}
