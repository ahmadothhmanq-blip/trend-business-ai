import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { runSeoAgent } from "@/lib/ai-core/seo-agent";
import { buildWebsiteAnalyticsSummary } from "@/lib/ai-core/analytics";
import { runConversionOptimizer } from "@/lib/ai-core/conversion-optimizer";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * GET — Run AI SEO Agent analysis for a website generation.
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
  const project = generation.blueprint as unknown as GeneratedWebsiteProject;
  const files = extractWebsiteFilesFromBlueprint(generation.blueprint);

  if (!files.length) {
    return apiValidationError("Generation has no files to analyze.");
  }

  const profile = (project.businessProfile ||
    null) as CoreBusinessProfile | null;
  const strategy = (project.strategy || null) as CoreProductStrategy | null;

  const analytics = await buildWebsiteAnalyticsSummary(
    parsedId.id,
    14,
    auth.supabase,
  );
  const conversionOptimizer = await runConversionOptimizer({
    generationId: parsedId.id,
    conversionReport: project.conversionReport ?? null,
    industry: profile?.industry || null,
    projectName: generation.project_name || profile?.projectName || null,
    client: auth.supabase,
  });

  const report = runSeoAgent({
    generationId: parsedId.id,
    files,
    strategy: strategy || undefined,
    profile: profile || undefined,
    industryId: profile?.industry || null,
    seoPackage: project.seoPackage || null,
    performanceReport: project.performanceReport || null,
    assetManifest: (project.assetManifest as never) || null,
    analytics,
    conversionOptimizer,
    language: generation.language || profile?.tone || "en",
  });

  return NextResponse.json({
    report,
    generationId: parsedId.id,
    projectName: generation.project_name,
  });
}
