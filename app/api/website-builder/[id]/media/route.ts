import { NextResponse } from "next/server";
import { z } from "zod";
import { API_ERROR_CODES, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { assertBuilderAccess } from "@/lib/website/builder/access";
import { uploadWebsiteAsset, assertWebsiteAssetMime } from "@/lib/website/assets-storage";
import {
  listMediaAssets,
  upsertMediaAsset,
  deleteMediaAsset,
  patchMediaAsset,
} from "@/lib/ai-core/website-management/media/store";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;

type Params = { params: Promise<{ id: string }> };

const patchMediaSchema = z.object({
  assetId: z.string().uuid(),
  folder: z.string().max(80).optional(),
  filename: z.string().max(200).optional(),
  alt: z.string().max(200).optional(),
});

async function assertMediaAccess(
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

export async function GET(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const denied = await assertMediaAccess(auth.supabase!, auth.user!.id, parsedId.id);
  if (denied) return denied;

  const url = new URL(request.url);
  const folder = url.searchParams.get("folder") || undefined;
  const query = url.searchParams.get("q") || undefined;

  const assets = await listMediaAssets(parsedId.id, {
    client: auth.supabase,
    folder,
    query,
  });

  return NextResponse.json({ ok: true, assets });
}

export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const denied = await assertMediaAccess(auth.supabase!, auth.user!.id, parsedId.id);
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return apiValidationError("Missing file upload.");
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return apiValidationError("File exceeds the 12MB upload limit.");
    }

    const mimeError = assertWebsiteAssetMime(file.type || "");
    if (mimeError) {
      return apiValidationError(mimeError);
    }

    const folder = String(form.get("folder") || "uploads").slice(0, 80);
    const alt = String(form.get("alt") || "").slice(0, 200);
    const bytes = Buffer.from(await file.arrayBuffer());
    const assetId = randomUUID();
    const contentType = (file.type || "image/png").toLowerCase().split(";")[0]!.trim();

    const uploaded = await uploadWebsiteAsset({
      userId: auth.user!.id,
      generationKey: parsedId.id,
      assetId,
      bytes,
      contentType,
    });

    const url =
      uploaded?.publicUrl ||
      `data:${contentType};base64,${bytes.toString("base64")}`;

    const asset = await upsertMediaAsset(
      {
        userId: auth.user!.id,
        generationId: parsedId.id,
        id: assetId,
        filename: file.name,
        url,
        mime: contentType,
        size: file.size,
        folder,
        alt: alt || undefined,
      },
      auth.supabase,
    );

    return NextResponse.json({ ok: true, asset });
  } catch (err) {
    return serverErrorResponse("website-builder.media.upload", err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const denied = await assertMediaAccess(auth.supabase!, auth.user!.id, parsedId.id);
  if (denied) return denied;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = patchMediaSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const asset = await patchMediaAsset(
    parsedId.id,
    parsed.data.assetId,
    {
      folder: parsed.data.folder,
      filename: parsed.data.filename,
      alt: parsed.data.alt,
    },
    auth.supabase,
  );

  if (!asset) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Asset not found.");
  }

  return NextResponse.json({ ok: true, asset });
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceWebsiteUserMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const denied = await assertMediaAccess(auth.supabase!, auth.user!.id, parsedId.id);
  if (denied) return denied;

  const url = new URL(request.url);
  const assetId = url.searchParams.get("assetId");
  if (!assetId) {
    return apiValidationError("assetId query param is required");
  }

  const ok = await deleteMediaAsset(parsedId.id, assetId, auth.supabase);
  return NextResponse.json({ ok });
}
