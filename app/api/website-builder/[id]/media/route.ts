import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { enforceWebsiteUserMutationRateLimit } from "@/lib/website/public-endpoints";
import { uploadWebsiteAsset } from "@/lib/website/assets-storage";
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

export async function GET(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("id")
    .eq("id", parsedId.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
  }
  if (!data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

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

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("id")
    .eq("id", parsedId.id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
  }
  if (!data) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Website not found.");
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return apiValidationError("Missing file upload.");
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return apiValidationError("File exceeds the 12MB upload limit.");
    }

    const folder = String(form.get("folder") || "uploads").slice(0, 80);
    const alt = String(form.get("alt") || "").slice(0, 200);
    const bytes = Buffer.from(await file.arrayBuffer());
    const assetId = randomUUID();

    const uploaded = await uploadWebsiteAsset({
      userId: auth.user!.id,
      generationKey: parsedId.id,
      assetId,
      bytes,
      contentType: file.type || "application/octet-stream",
    });

    const url =
      uploaded?.publicUrl ||
      `data:${file.type};base64,${bytes.toString("base64")}`;

    const asset = await upsertMediaAsset(
      {
        userId: auth.user!.id,
        generationId: parsedId.id,
        id: assetId,
        filename: file.name,
        url,
        mime: file.type || "application/octet-stream",
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

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = (await request.json()) as {
    assetId?: string;
    folder?: string;
    filename?: string;
    alt?: string;
  };

  if (!body.assetId) {
    return apiValidationError("assetId is required");
  }

  const asset = await patchMediaAsset(
    parsedId.id,
    body.assetId,
    {
      folder: body.folder,
      filename: body.filename,
      alt: body.alt,
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

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const url = new URL(request.url);
  const assetId = url.searchParams.get("assetId");
  if (!assetId) {
    return apiValidationError("assetId query param is required");
  }

  const ok = await deleteMediaAsset(parsedId.id, assetId, auth.supabase);
  return NextResponse.json({ ok });
}
