import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { z } from "zod";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import type { WebsiteGeneration } from "@/types/database";
import {
  getPublicationForGeneration,
  runPublishingAction,
} from "@/lib/ai-core/publishing";
import { buildDeploymentDashboard } from "@/lib/ai-core/deployment";
import { recordDeploymentEvent } from "@/lib/ai-core/deployment";
import { normalizeSubdomainHandle } from "@/lib/ai-core/domains";
import {
  buildPublishQualityPayload,
  prepareSuccessMessage,
  publishSuccessMessage,
} from "@/lib/website/publish-quality";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function userHandleFromAuth(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string | null {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.username === "string" && meta.username) ||
    (typeof meta.full_name === "string" && meta.full_name.split(" ")[0]) ||
    null;
  return normalizeSubdomainHandle(
    fromMeta || user.email?.split("@")[0] || null,
  );
}

/**
 * GET — Deployment dashboard (publish status, domains, history, SSL).
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

  const generation = accessResult.generation;

  const publication = await getPublicationForGeneration({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generationId: parsedId.id,
  });

  const handle = userHandleFromAuth(auth.user!);
  const dashboard = await buildDeploymentDashboard({
    generationId: parsedId.id,
    projectName: generation.project_name,
    publication,
    userId: auth.user!.id,
    userHandle: handle,
    hasAnalytics: true,
    hasSeoAgent: true,
    client: auth.supabase,
  });

  return NextResponse.json({ dashboard });
}

const actionSchema = z.object({
  action: z.enum([
    "prepare",
    "publish",
    "unpublish",
    "archive",
    "republish",
  ]),
  force: z.boolean().optional(),
});

/**
 * POST — Publish / prepare / unpublish / archive via Publishing Engine.
 * Enforces the same quality gates as /publish (including force override).
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiErrorResponse(API_ERROR_CODES.INVALID_JSON, 400);
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const deployAction = parsed.data.action;
  const accessAction =
    deployAction === "publish" || deployAction === "republish"
      ? "publish"
      : "manage";
  const accessResult = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    parsedId.id,
    accessAction,
  );
  if (accessResult instanceof NextResponse) return accessResult;

  const generation = accessResult.generation as WebsiteGeneration;
  const handle = userHandleFromAuth(auth.user!);
  const force = parsed.data.force === true;

  const result = await runPublishingAction({
    supabase: auth.supabase,
    userId: auth.user!.id,
    generation,
    action: parsed.data.action,
    userHandle: handle,
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

  const kindByAction = {
    prepare: "prepared",
    publish: "published",
    republish: "republished",
    unpublish: "unpublished",
    archive: "archived",
  } as const;

  await recordDeploymentEvent(
    {
      userId: auth.user!.id,
      generationId: parsedId.id,
      kind: kindByAction[parsed.data.action],
      message: `Deployment action: ${parsed.data.action}`,
      url: result.publication.planned_public_url,
    },
    auth.supabase,
  );

  const dashboard = await buildDeploymentDashboard({
    generationId: parsedId.id,
    projectName: generation.project_name,
    publication: result.publication,
    userId: auth.user!.id,
    userHandle: handle,
    hasAnalytics: true,
    hasSeoAgent: true,
    client: auth.supabase,
  });

  const { gates } = result;
  const qualityRecommendations = buildPublishQualityPayload(gates);
  const publishAction =
    parsed.data.action === "publish" || parsed.data.action === "republish";

  return NextResponse.json({
    success: true,
    publication: result.publication,
    dashboard,
    publicUrl: result.publicUrl ?? result.publication.planned_public_url,
    managementQuality: gates.managementQuality,
    conversionChecklist: gates.conversionChecklist,
    seoPerformanceChecklist: gates.seoChecklist,
    finalQualityChecklist: gates.finalChecklist,
    qualityRecommendations,
    message:
      parsed.data.action === "prepare"
        ? prepareSuccessMessage(gates)
        : publishAction
          ? publishSuccessMessage(gates, force)
          : `Deployment action: ${parsed.data.action}`,
  });
}
