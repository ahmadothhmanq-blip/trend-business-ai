import { randomUUID } from "node:crypto";
import type { PublishTarget } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { VideoPublishError } from "@/lib/ai-core/video-production-platform/publish/errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type VideoPublicationRow = {
  id: string;
  user_id: string;
  project_id: string;
  artifact_id: string;
  slug: string;
  title: string;
  description: string;
  mime_type: string;
  duration_sec: number;
  platform: "web";
  status: "draft" | "publishing" | "published" | "unpublished" | "failed";
  published_at: string | null;
  unpublished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoPublicationRecord = {
  id: string;
  userId: string;
  projectId: string;
  artifactId: string;
  slug: string;
  title: string;
  description: string;
  mimeType: string;
  durationSec: number;
  platform: "web";
  status: VideoPublicationRow["status"];
  publishedAt: string | null;
  unpublishedAt: string | null;
};

function throwIfError(error: { message?: string; code?: string } | null, action: string): void {
  if (!error) return;
  throw new VideoPublishError(`${action} failed: ${error.message || "unknown"}`, "unconfigured");
}

export function publicationFromRow(row: VideoPublicationRow): VideoPublicationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    artifactId: row.artifact_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    mimeType: row.mime_type,
    durationSec: Number(row.duration_sec),
    platform: "web",
    status: row.status,
    publishedAt: row.published_at,
    unpublishedAt: row.unpublished_at,
  };
}

export function publicationToPublishTarget(record: VideoPublicationRecord): PublishTarget {
  return {
    id: record.id,
    projectId: record.projectId,
    artifactId: record.artifactId,
    platform: "web",
    status: record.status,
    slug: record.slug,
    publicPath: `/w/video/${record.slug}`,
  };
}

export function publicVideoPath(slug: string): string {
  return `/w/video/${slug}`;
}

export async function loadPublicationByProject(
  supabase: AnySupabase,
  projectId: string,
): Promise<VideoPublicationRecord | null> {
  const { data, error } = await supabase
    .from("video_publications")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    if (/schema cache|does not exist|video_publications/i.test(error.message || "")) return null;
    throwIfError(error, "video_publications.read");
  }
  return data ? publicationFromRow(data as VideoPublicationRow) : null;
}

export async function loadPublicationBySlug(
  supabase: AnySupabase,
  slug: string,
): Promise<VideoPublicationRecord | null> {
  const { data, error } = await supabase
    .from("video_publications")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    if (/schema cache|does not exist|video_publications/i.test(error.message || "")) return null;
    throwIfError(error, "video_publications.read");
  }
  return data ? publicationFromRow(data as VideoPublicationRow) : null;
}

export async function upsertPublication(
  supabase: AnySupabase,
  input: {
    id?: string;
    userId: string;
    projectId: string;
    artifactId: string;
    slug: string;
    title: string;
    description: string;
    mimeType: string;
    durationSec: number;
    status: VideoPublicationRow["status"];
    publishedAt?: string | null;
    unpublishedAt?: string | null;
  },
): Promise<VideoPublicationRecord> {
  const existing = await loadPublicationByProject(supabase, input.projectId);
  const now = new Date().toISOString();
  if (existing) {
    const { data, error } = await supabase
      .from("video_publications")
      .update({
        artifact_id: input.artifactId,
        slug: existing.slug,
        title: input.title,
        description: input.description,
        mime_type: input.mimeType,
        duration_sec: input.durationSec,
        status: input.status,
        published_at: input.publishedAt ?? existing.publishedAt,
        unpublished_at: input.unpublishedAt ?? null,
        updated_at: now,
      })
      .eq("id", existing.id)
      .eq("user_id", input.userId)
      .select("*")
      .single();
  if (error) {
    if (/schema cache|does not exist|video_publications/i.test(error.message || "")) {
      throw new VideoPublishError(
        "video_publications table is missing. Apply migration 096_video_publications.sql.",
        "unconfigured",
      );
    }
    throwIfError(error, "video_publications.update");
  }
    return publicationFromRow(data as VideoPublicationRow);
  }

  const { data, error } = await supabase
    .from("video_publications")
    .insert({
      id: input.id || randomUUID(),
      user_id: input.userId,
      project_id: input.projectId,
      artifact_id: input.artifactId,
      slug: input.slug,
      title: input.title,
      description: input.description,
      mime_type: input.mimeType,
      duration_sec: input.durationSec,
      platform: "web",
      status: input.status,
      published_at: input.publishedAt ?? now,
      unpublished_at: input.unpublishedAt ?? null,
    })
    .select("*")
    .single();
  if (error) {
    if (/schema cache|does not exist|video_publications/i.test(error.message || "")) {
      throw new VideoPublishError(
        "video_publications table is missing. Apply migration 096_video_publications.sql.",
        "unconfigured",
      );
    }
    throwIfError(error, "video_publications.insert");
  }
  return publicationFromRow(data as VideoPublicationRow);
}
