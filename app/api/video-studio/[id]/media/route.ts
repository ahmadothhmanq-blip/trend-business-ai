import { NextResponse } from "next/server";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import {
  listVideoStudioMedia,
  getVideoStudioMediaPreview,
  deleteVideoStudioMedia,
  uploadVideoStudioMedia,
} from "@/lib/ai-core/video-production-platform";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/**
 * GET — list stored media for a video generation (from video_media table).
 * Query: ?mediaId=… for signed preview URL of one asset.
 */
export async function GET(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  try {
    const mediaId = new URL(request.url).searchParams.get("mediaId");
    if (mediaId) {
      const preview = await getVideoStudioMediaPreview({
        supabase: auth.supabase,
        userId: auth.user!.id,
        mediaId,
      });
      if (!preview.record) {
        return NextResponse.json({ error: "Media not found." }, { status: 404 });
      }
      return NextResponse.json({
        previewUrl: preview.url,
        media: preview.record,
      });
    }

    const media = await listVideoStudioMedia({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: parsedId.id,
    });

    return NextResponse.json({
      media: media.map((m) => ({
        id: m.id,
        kind: m.kind,
        mime_type: m.mimeType,
        public_url: m.publicUrl,
        storage_path: m.storagePath,
        provider: m.provider,
        created_at: m.createdAt,
        size_bytes: m.sizeBytes,
        duration_sec: m.durationSec,
      })),
      message:
        media.length === 0
          ? "No media yet. Run Full MP4 render or Real TTS. Apply migration 044 if table is missing."
          : undefined,
    });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.media",
      error,
      "Unable to list media.",
    );
  }
}

const uploadSchema = z.object({
  kind: z.enum(["thumbnail", "poster", "source-image", "export"]).default("thumbnail"),
  filename: z.string().min(1).max(120),
  mimeType: z.string().min(3),
  /** base64 payload (no data: prefix required) */
  base64: z.string().min(8),
  durationSec: z.number().optional(),
});

/**
 * POST — upload a media asset (thumbnail / source image) into storage library.
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid upload" },
      { status: 400 },
    );
  }

  try {
    const bytes = new Uint8Array(Buffer.from(parsed.data.base64, "base64"));
    if (bytes.byteLength > 8_000_000) {
      return NextResponse.json(
        { error: "File too large (max 8MB via this endpoint)." },
        { status: 400 },
      );
    }

    const uploaded = await uploadVideoStudioMedia({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: parsedId.id,
      kind: parsed.data.kind,
      bytes,
      mimeType: parsed.data.mimeType,
      filename: parsed.data.filename,
      durationSec: parsed.data.durationSec,
      provider: "upload",
    });

    return NextResponse.json({
      message: "Media uploaded.",
      asset: uploaded.asset,
      record: uploaded.record,
    });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.media.upload",
      error,
      "Unable to upload media.",
    );
  }
}

const deleteSchema = z.object({
  mediaId: z.string().min(1),
});

/**
 * DELETE — remove one media asset from storage + DB.
 */
export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "mediaId required" }, { status: 400 });
  }

  try {
    // Ensure media belongs to this generation when possible
    const list = await listVideoStudioMedia({
      supabase: auth.supabase,
      userId: auth.user!.id,
      generationId: parsedId.id,
    });
    const owned = list.find((m) => m.id === parsed.data.mediaId);
    if (!owned) {
      return NextResponse.json({ error: "Media not found for this video." }, { status: 404 });
    }

    const result = await deleteVideoStudioMedia({
      supabase: auth.supabase,
      userId: auth.user!.id,
      mediaId: parsed.data.mediaId,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Delete failed" }, { status: 500 });
    }
    return NextResponse.json({ message: "Media deleted.", mediaId: parsed.data.mediaId });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.media.delete",
      error,
      "Unable to delete media.",
    );
  }
}
