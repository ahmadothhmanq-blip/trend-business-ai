import { requireUser, parseJsonBody, parseUuidParam } from "@/lib/api/helpers";
import {
  API_ERROR_CODES,
  apiErrorResponse,
  apiValidationError,
} from "@/lib/i18n/api-errors";
import { serverErrorResponse } from "@/lib/api/errors";
import { updateWebsiteGenerationInPlace } from "@/lib/website/save-generation";
import { applyVisualSkinToProjectAsyncWithNotes } from "@/lib/website/visual-skin/apply-project";
import { extractWebsiteFilesFromBlueprint } from "@/plugins/website/iteration";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";
import { z } from "zod";
import { getVisualSkin } from "@/lib/website/visual-skin/registry";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  visualSkinId: z.string().trim().min(1),
});

/**
 * POST /api/website-builder/[id]/visual-skin
 * Full visual skin reapply — rebuilds layout/components (Bold-style) + skin tokens.
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

  if (!getVisualSkin(parsed.data.visualSkinId)) {
    return apiErrorResponse(API_ERROR_CODES.INVALID_INPUT, 400, "Unknown visual skin");
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

    const { project: updated, notes } = await applyVisualSkinToProjectAsyncWithNotes(
      project,
      parsed.data.visualSkinId,
      generation.language,
    );

    const saved = await updateWebsiteGenerationInPlace({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: generation.id,
      project: updated,
      language: generation.language || "English",
    });

    if (!saved.ok) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, saved.error);
    }

    return NextResponse.json({
      ok: true,
      visualSkinId: parsed.data.visualSkinId,
      notes,
      project: saved.project,
      generation: saved.generation,
    });
  } catch (error) {
    return serverErrorResponse(
      "POST /api/website-builder/[id]/visual-skin",
      error,
    );
  }
}
