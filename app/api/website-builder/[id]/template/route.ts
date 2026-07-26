import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { serverErrorResponse } from "@/lib/api/errors";
import { updateWebsiteGenerationInPlace } from "@/lib/website/save-generation";
import { applyTemplateIntelligenceRetheme } from "@/lib/ai-core/template-intelligence";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { z } from "zod";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  templateIntelligenceId: z.string().trim().min(1),
});

/**
 * POST /api/website-builder/[id]/template
 * Switch Template Intelligence on the active project — no AI, no new generation row.
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
    const { data: row, error } = await auth.supabase
      .from("website_generations")
      .select("*")
      .eq("id", id)
      .eq("user_id", auth.user!.id)
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Generation not found.");
    }

    const generation = row as WebsiteGeneration;
    const files = extractWebsiteFilesFromBlueprint(generation.blueprint);
    const blueprint = (generation.blueprint || {}) as unknown as GeneratedWebsiteProject;
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
      settings: blueprint.settings,
    };

    const switched = applyTemplateIntelligenceRetheme({
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

    return NextResponse.json({
      ok: true,
      notes: switched.notes,
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
