import { NextResponse } from "next/server";
import { z } from "zod";
import { API_ERROR_CODES, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { assertBuilderAccess } from "@/lib/website/builder/access";
import {
  applyProjectImageOperation,
  listProjectSiteImages,
  loadProjectForImageManagement,
  validateProjectImages,
} from "@/lib/website/image-management/service";
import { IMAGE_SLOT_KINDS } from "@/lib/ai-core/image-engine/slots";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const operationSchema = z.object({
  action: z.enum([
    "replace",
    "upload",
    "generate",
    "delete",
    "crop",
    "reposition",
    "restore-default",
    "edit-alt",
  ]),
  imageId: z.string().min(1).max(80),
  slot: z.enum(IMAGE_SLOT_KINDS).optional(),
  url: z.string().url().max(4000).optional(),
  alt: z.string().max(300).optional(),
  objectPosition: z.string().max(80).optional(),
  crop: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  generatePrompt: z.string().max(500).optional(),
});

async function assertAccess(
  supabase: NonNullable<Awaited<ReturnType<typeof requireUser>>["supabase"]>,
  userId: string,
  generationId: string,
) {
  const access = await assertBuilderAccess(supabase, userId, generationId, "manage");
  if (!access) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }
  return null;
}

/** GET — list semantic image slots + validation report */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const denied = await assertAccess(auth.supabase!, auth.user!.id, parsedId.id);
  if (denied) return denied;

  const loaded = await loadProjectForImageManagement({
    supabase: auth.supabase!,
    userId: auth.user!.id,
    generationId: parsedId.id,
  });
  if (!loaded.ok) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, loaded.error);
  }

  const { images, industry } = await listProjectSiteImages({
    project: loaded.project,
  });
  const validation = validateProjectImages(loaded.project.files ?? [], {
    industry,
    templatePackageId: String(
      (loaded.project.settings as Record<string, unknown> | undefined)
        ?.templatePackageId ?? "",
    ),
  });

  return NextResponse.json({
    ok: true,
    industry,
    images,
    validation: {
      passed: validation.passed,
      repairs: validation.repairs,
      duplicatesRemoved: validation.duplicatesRemoved,
      industryId: validation.industryId,
      issues: validation.issues,
      slotCount: validation.slotCount,
      uniqueUrlCount: validation.uniqueUrlCount,
    },
  });
}

/** POST — apply image management operation */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const denied = await assertAccess(auth.supabase!, auth.user!.id, parsedId.id);
  if (denied) return denied;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = operationSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message ?? "Invalid request");
  }

  try {
    const result = await applyProjectImageOperation({
      supabase: auth.supabase!,
      userId: auth.user!.id,
      generationId: parsedId.id,
      request: parsed.data,
    });
    if (!result.ok) {
      return apiValidationError(result.error);
    }
    const listed = await listProjectSiteImages({ project: result.project });
    return NextResponse.json({
      ok: true,
      image: result.image,
      images: listed.images,
      project: result.project,
    });
  } catch (err) {
    return serverErrorResponse("website-builder.site-images", err);
  }
}
