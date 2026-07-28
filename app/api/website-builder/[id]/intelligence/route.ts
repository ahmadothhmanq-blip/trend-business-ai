import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  runWebsiteIntelligence,
  runWebsitePerformanceUpgrade,
} from "@/lib/ai-core/website-design-platform";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";

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

  const accessResult = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
    "view",
  );
  if (accessResult instanceof NextResponse) return accessResult;

  const generation = accessResult.generation as WebsiteGeneration;
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
