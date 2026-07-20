/**
 * Media asset revision tracking (Video Studio) — versions of stored media, not JSON blobs.
 */

import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";
import type { StoredMediaRecord } from "@/lib/ai-core/video-production-platform/media-storage";

export type MediaRevision = {
  id: string;
  mediaId: string;
  revision: number;
  storagePath: string;
  publicUrl: string | null;
  note?: string;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

/**
 * Append a revision entry onto video_media.meta.revisions and optionally clone row.
 */
export async function recordMediaRevision(params: {
  supabase: AnySupabase;
  userId: string;
  mediaId: string;
  storagePath: string;
  publicUrl?: string | null;
  note?: string;
}): Promise<MediaRevision | null> {
  const { data, error } = await params.supabase
    .from("video_media")
    .select("*")
    .eq("id", params.mediaId)
    .eq("user_id", params.userId)
    .maybeSingle();
  if (error || !data) return null;

  const meta = (data.meta as Record<string, unknown>) || {};
  const existing = Array.isArray(meta.revisions)
    ? (meta.revisions as MediaRevision[])
    : [];
  const revision: MediaRevision = {
    id: vid("mrev", params.mediaId, existing.length + 1),
    mediaId: params.mediaId,
    revision: existing.length + 1,
    storagePath: params.storagePath,
    publicUrl: params.publicUrl ?? null,
    note: params.note,
    createdAt: nowIso(),
  };
  const nextMeta = {
    ...meta,
    revisions: [...existing, revision].slice(-20),
    currentRevision: revision.revision,
  };

  await params.supabase
    .from("video_media")
    .update({
      meta: nextMeta,
      storage_path: params.storagePath,
      public_url: params.publicUrl ?? data.public_url,
    })
    .eq("id", params.mediaId)
    .eq("user_id", params.userId);

  return revision;
}

export function revisionsFromRecord(
  record: StoredMediaRecord | { meta?: Record<string, unknown> },
): MediaRevision[] {
  const meta = record.meta || {};
  return Array.isArray(meta.revisions) ? (meta.revisions as MediaRevision[]) : [];
}
