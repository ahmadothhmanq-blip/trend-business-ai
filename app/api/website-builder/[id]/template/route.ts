import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiValidationError } from "@/lib/i18n/api-errors";
import { serverErrorResponse } from "@/lib/api/errors";
import { updateWebsiteGenerationInPlace } from "@/lib/website/save-generation";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import { applyTemplateIntelligenceRetheme } from "@/lib/ai-core/template-intelligence";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.union([
  z.object({
    templatePackageId: z.string().trim().min(1),
  }),
  z.object({
    templateIntelligenceId: z.string().trim().min(1),
  }),
]);

function buildProjectFromGeneration(
  generation: WebsiteGeneration,
): GeneratedWebsiteProject {
  const files = extractWebsiteFilesFromBlueprint(generation.blueprint);
  const blueprint = (generation.blueprint || {}) as unknown as GeneratedWebsiteProject;
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
    settings: blueprint.settings,
  };
}

/**
 * POST /api/website-builder/[id]/template
 * Switch structure template or Template Intelligence on the active project — no AI, no new generation row.
 */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = bodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  try {
    const accessResult = await requireWebsiteGenerationAccess(
      auth.supabase,
      auth.user!.id,
      id,
      "edit",
    );
    if (accessResult instanceof NextResponse) return accessResult;

    const generation = accessResult.generation as WebsiteGeneration;
    const project = buildProjectFromGeneration(generation);

    const switched =
      "templatePackageId" in parsed.data
        ? applyStructureTemplateToProject({
            project,
            templatePackageId: parsed.data.templatePackageId,
            language: generation.language,
          })
        : applyTemplateIntelligenceRetheme({
            project,
            templateId: parsed.data.templateIntelligenceId,
            language: generation.language,
          });

    const saved = await updateWebsiteGenerationInPlace({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: generation.id,
      project: switched.project,
      language: generation.language || "English",
    });

    if (!saved.ok) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, saved.error);
    }

    const structureTemplateId =
      "templatePackageId" in parsed.data
        ? parsed.data.templatePackageId
        : ((saved.project.settings as Record<string, unknown> | undefined)
            ?.websiteStructureTemplateId as string | undefined);

    return NextResponse.json({
      ok: true,
      notes: switched.notes,
      structureTemplateId: structureTemplateId ?? null,
      template: {
        id: switched.template.id,
        name: switched.template.name,
        category: switched.template.category,
        designPreset: switched.template.designPreset,
        designStyle: switched.template.designStyle,
        premiumTemplateId: switched.template.premiumTemplateId,
        components: switched.template.components,
        colors: switched.template.colors,
        typography: switched.template.typography,
      },
      project: saved.project,
      generation: saved.generation,
    });
  } catch (error) {
    return serverErrorResponse(
      "POST /api/website-builder/[id]/template",
      error,
    );
  }
}
