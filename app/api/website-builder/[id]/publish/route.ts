import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import {
  buildPublishQualityPayload,
  prepareSuccessMessage,
  publishSuccessMessage,
} from "@/lib/website/publish-quality";
import { isWebsitePublishEnabled } from "@/lib/website/publish";
import { runPublishingAction } from "@/lib/ai-core/publishing";
import type { WebsiteGeneration } from "@/types/database";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  action: z.enum(["prepare", "publish", "unpublish"]).default("publish"),
  force: z.boolean().optional(),
});

async function loadAccessibleGeneration(
  auth: Awaited<ReturnType<typeof requireUser>>,
  id: string,
  action: "view" | "publish",
): Promise<WebsiteGeneration | NextResponse> {
  if (!auth.user) {
    return apiErrorResponse(API_ERROR_CODES.UNAUTHORIZED, 401);
  }
  const result = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user.id,
    id,
    action,
  );
  if (result instanceof NextResponse) return result;
  return result.generation;
}

async function readPublishBody(request: Request) {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Publish actions for a website generation:
 * - prepare → status prepared (draft snapshot)
 * - publish → prepared→published + public /w/[slug] (blocked when critical issues exist)
 * - unpublish → remove from public access
 */
export async function POST(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const rawBody = await readPublishBody(request);
  if (rawBody === null) {
    return apiErrorResponse(API_ERROR_CODES.INVALID_JSON, 400);
  }

  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const action = parsed.data.action;
  const force = parsed.data.force === true;

  const generationResult = await loadAccessibleGeneration(auth, id, "publish");
  if (generationResult instanceof NextResponse) return generationResult;
  const generation = generationResult;

  const result = await runPublishingAction({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generation,
    action,
    force,
  });

  if (!result.ok) {
    if (result.gateBlock) {
      return apiErrorResponse(
        API_ERROR_CODES.INVALID_INPUT,
        422,
        result.error,
        undefined,
        {
          qualityRecommendations: result.qualityRecommendations,
          blockers: result.blockers,
        },
      );
    }
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, result.status, result.error);
  }

  const { gates } = result;
  const qualityRecommendations = buildPublishQualityPayload(gates);

  if (action === "unpublish") {
    return NextResponse.json({
      publication: result.publication,
      publishEnabled: isWebsitePublishEnabled(),
      message: "Website unpublished. Public URL no longer serves this version.",
    });
  }

  if (action === "prepare") {
    return NextResponse.json({
      publication: result.publication,
      publishEnabled: result.publishEnabled,
      htmlBytes: result.htmlBytes,
      publicPath: result.publication.public_path,
      plannedPublicUrl: result.publication.planned_public_url,
      managementQuality: gates.managementQuality,
      conversionChecklist: gates.conversionChecklist,
      seoPerformanceChecklist: gates.seoChecklist,
      finalQualityChecklist: gates.finalChecklist,
      qualityRecommendations,
      message: prepareSuccessMessage(gates),
    });
  }

  return NextResponse.json({
    publication: result.publication,
    publishEnabled: result.publishEnabled,
    htmlBytes: result.htmlBytes,
    publicUrl: result.publicUrl,
    publicPath: result.publication.public_path,
    conversionChecklist: gates.conversionChecklist,
    seoPerformanceChecklist: gates.seoChecklist,
    finalQualityChecklist: gates.finalChecklist,
    qualityRecommendations,
    message: publishSuccessMessage(gates, force),
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const accessResult = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    id,
    "view",
  );
  if (accessResult instanceof NextResponse) return accessResult;

  const { data, error } = await auth.supabase
    .from("website_publications")
    .select("*")
    .eq("generation_id", id)
    .eq("user_id", accessResult.generation.user_id)
    .maybeSingle();

  if (error) {
    if (isMissingTableMessage(error.message)) {
      return NextResponse.json({
        publication: null,
        publishEnabled: isWebsitePublishEnabled(),
      });
    }
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
  }

  return NextResponse.json({
    publication: data,
    publishEnabled: isWebsitePublishEnabled(),
    publicUrl:
      data?.status === "published"
        ? data.planned_public_url || data.public_path
        : null,
  });
}

function isMissingTableMessage(message?: string) {
  const msg = message?.toLowerCase() ?? "";
  return msg.includes("relation") || msg.includes("does not exist");
}
