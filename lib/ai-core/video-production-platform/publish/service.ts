/**
 * Production Video Studio publish / unpublish.
 * Does not generate video, change providers, or touch editor/audio.
 */

import { createHash } from "node:crypto";
import type { PublishTarget, VideoArtifact } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import { persistTransition } from "@/lib/ai-core/video-production-platform/state-machine/service";
import { loadLatestQualityReport, loadOwnedFinalComposite, resolveActivePlanId } from "@/lib/ai-core/video-production-platform/persistence";
import { fetchRemoteVideoToBytes, isSafePrivateMediaUrl, VIDEO_STUDIO_BUCKET } from "@/lib/ai-core/video-production-platform/media-storage";
import { isStubVideoBytes } from "@/lib/ai-core/video-production-platform/providers/types";
import { sniffPlayableVideoMime } from "@/lib/ai-core/video-production-platform/export-production";
import { VideoPublishError } from "@/lib/ai-core/video-production-platform/publish/errors";
import {
  loadPublicationByProject,
  loadPublicationBySlug,
  publicationToPublishTarget,
  publicVideoPath,
  upsertPublication,
  type VideoPublicationRecord,
} from "@/lib/ai-core/video-production-platform/publish/persist";
import { buildPublicVideoHtml } from "@/lib/ai-core/video-production-platform/publish/html";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const MIN_VIDEO_BYTES = 1024;

export type PublishProjectResult = {
  publication: VideoPublicationRecord;
  target: PublishTarget;
  publicPath: string;
  reused: boolean;
  domainState: "published";
};

export type UnpublishProjectResult = {
  publication: VideoPublicationRecord | null;
  target: PublishTarget | null;
  reused: boolean;
  domainState: "video_rendered" | "unpublished";
};

function slugify(input: string, projectId: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = createHash("sha256").update(projectId).digest("hex").slice(0, 8);
  return `${base || "video"}-${suffix}`;
}

async function loadOwnedProject(
  supabase: AnySupabase,
  input: { userId: string; projectId: string },
): Promise<{
  id: string;
  userId: string;
  domainState: string;
  title: string;
  description: string;
}> {
  const { data, error } = await supabase
    .from("video_generations")
    .select("id, user_id, domain_state, status, video_name, prompt")
    .eq("id", input.projectId)
    .maybeSingle();
  if (error) throw new VideoPublishError(error.message, "unconfigured");
  if (!data) throw new VideoPublishError("Video project not found.", "not_found");
  if (String(data.user_id) !== input.userId) {
    throw new VideoPublishError("Video project does not belong to this user.", "ownership");
  }
  return {
    id: String(data.id),
    userId: String(data.user_id),
    domainState: String(data.domain_state || data.status || "draft"),
    title: String(data.video_name || "Published video"),
    description: String(data.prompt || "").slice(0, 300),
  };
}

function assertPlayableComposite(artifact: VideoArtifact, bytes?: Uint8Array | null): void {
  if (!isValidVideoArtifact(artifact) || artifact.kind !== "composite") {
    throw new VideoPublishError(
      "Publish requires a final playable video/mp4 or video/webm composite with duration > 0.",
      "invalid_artifact",
    );
  }
  const mime = (artifact.mimeType || "").split(";")[0].trim().toLowerCase();
  if (mime !== "video/mp4" && mime !== "video/webm") {
    throw new VideoPublishError("Publish artifact MIME must be video/mp4 or video/webm.", "invalid_artifact");
  }
  if (!(artifact.durationSec > 0)) {
    throw new VideoPublishError("Publish artifact duration must be greater than 0.", "invalid_artifact");
  }
  if (bytes && bytes.byteLength >= MIN_VIDEO_BYTES) {
    if (isStubVideoBytes(bytes) || sniffPlayableVideoMime(bytes) !== mime) {
      throw new VideoPublishError("Publish artifact failed integrity checks (stub/SVG/signature).", "invalid_artifact");
    }
  }
}

async function readArtifactBytes(
  supabase: AnySupabase,
  row: { storage_path?: string | null; public_url?: string | null },
  url: string,
): Promise<Uint8Array | null> {
  const fetched = await fetchRemoteVideoToBytes(url);
  if (fetched?.byteLength) return fetched;
  if (!row.storage_path) return null;
  const downloaded = await supabase.storage.from(VIDEO_STUDIO_BUCKET).download(row.storage_path);
  const blob = downloaded?.data;
  if (blob && typeof blob.arrayBuffer === "function") {
    const buf = new Uint8Array(await blob.arrayBuffer());
    if (buf.byteLength) return buf;
  }
  return null;
}

export async function signPublicVideoDeliveryUrl(input: {
  supabase: AnySupabase;
  storagePath: string;
  fallbackUrl?: string | null;
  expiresInSec?: number;
}): Promise<string> {
  if (input.fallbackUrl?.startsWith("data:video/")) return input.fallbackUrl;
  const signed = await input.supabase.storage
    .from(VIDEO_STUDIO_BUCKET)
    .createSignedUrl(input.storagePath, input.expiresInSec ?? 3600);
  const signedUrl = signed.data?.signedUrl ?? null;
  if (isSafePrivateMediaUrl(signedUrl)) return signedUrl as string;
  if (isSafePrivateMediaUrl(input.fallbackUrl)) return input.fallbackUrl as string;
  throw new VideoPublishError("Could not create a signed public delivery URL.", "unconfigured");
}

export async function publishVideoProject(input: {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
}): Promise<PublishProjectResult> {
  const project = await loadOwnedProject(input.supabase, input);
  const planId = await resolveActivePlanId(input.supabase, input.projectId);
  if (!planId) {
    throw new VideoPublishError("Publish requires an active plan.", "missing_plan");
  }

  let stored: Awaited<ReturnType<typeof loadOwnedFinalComposite>> = null;
  try {
    stored = await loadOwnedFinalComposite(input.supabase, {
      userId: input.userId,
      projectId: input.projectId,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "CompositeOwnershipError") {
      throw new VideoPublishError(error.message, "ownership");
    }
    throw error;
  }
  if (!stored) {
    throw new VideoPublishError(
      "No playable composite artifact. Draft, storyboard, and SVG files cannot be published.",
      "missing_artifact",
    );
  }

  const bytes = await readArtifactBytes(input.supabase, stored.row, stored.artifact.url);
  assertPlayableComposite(stored.artifact, bytes);

  const qc = await loadLatestQualityReport(input.supabase, input.projectId);
  if (qc?.verdict === "BLOCKED") {
    throw new VideoPublishError("Quality control BLOCKED this project. Publish is not allowed.", "qc_blocked");
  }

  const existing = await loadPublicationByProject(input.supabase, input.projectId);
  if (
    existing?.status === "published" &&
    existing.artifactId === stored.artifact.id &&
    (project.domainState === "published" || project.domainState === "video_rendered")
  ) {
    if (project.domainState !== "published") {
      await persistTransition(input.supabase, {
        projectId: input.projectId,
        from: project.domainState,
        to: "published",
        artifact: stored.artifact,
      });
    }
    return {
      publication: existing,
      target: publicationToPublishTarget(existing),
      publicPath: publicVideoPath(existing.slug),
      reused: true,
      domainState: "published",
    };
  }

  if (project.domainState !== "video_rendered" && project.domainState !== "published") {
    throw new VideoPublishError(
      `Publish requires project state video_rendered (current: ${project.domainState}).`,
      "invalid_state",
    );
  }

  const slug = existing?.slug || slugify(project.title, input.projectId);
  const publication = await upsertPublication(input.supabase, {
    userId: input.userId,
    projectId: input.projectId,
    artifactId: stored.artifact.id,
    slug,
    title: project.title,
    description: project.description,
    mimeType: stored.artifact.mimeType.split(";")[0].trim().toLowerCase(),
    durationSec: stored.artifact.durationSec,
    status: "published",
    publishedAt: new Date().toISOString(),
    unpublishedAt: null,
  });

  if (project.domainState !== "published") {
    await persistTransition(input.supabase, {
      projectId: input.projectId,
      from: "video_rendered",
      to: "published",
      artifact: stored.artifact,
    });
  }

  return {
    publication,
    target: publicationToPublishTarget(publication),
    publicPath: publicVideoPath(publication.slug),
    reused: Boolean(existing && existing.artifactId === stored.artifact.id),
    domainState: "published",
  };
}

export async function unpublishVideoProject(input: {
  supabase: AnySupabase;
  userId: string;
  projectId: string;
}): Promise<UnpublishProjectResult> {
  const project = await loadOwnedProject(input.supabase, input);
  const existing = await loadPublicationByProject(input.supabase, input.projectId);

  if (!existing || existing.status === "unpublished") {
    if (project.domainState === "published") {
      let stored: Awaited<ReturnType<typeof loadOwnedFinalComposite>> = null;
      try {
        stored = await loadOwnedFinalComposite(input.supabase, {
          userId: input.userId,
          projectId: input.projectId,
        });
      } catch {
        stored = null;
      }
      if (stored && isValidVideoArtifact(stored.artifact)) {
        await persistTransition(input.supabase, {
          projectId: input.projectId,
          from: "published",
          to: "video_rendered",
          artifact: stored.artifact,
        });
      }
    }
    return {
      publication: existing,
      target: existing ? publicationToPublishTarget({ ...existing, status: "unpublished" }) : null,
      reused: true,
      domainState: "unpublished",
    };
  }

  const unpublished = await upsertPublication(input.supabase, {
    userId: input.userId,
    projectId: input.projectId,
    artifactId: existing.artifactId,
    slug: existing.slug,
    title: existing.title,
    description: existing.description,
    mimeType: existing.mimeType,
    durationSec: existing.durationSec,
    status: "unpublished",
    publishedAt: existing.publishedAt,
    unpublishedAt: new Date().toISOString(),
  });

  if (project.domainState === "published") {
    let stored: Awaited<ReturnType<typeof loadOwnedFinalComposite>> = null;
    try {
      stored = await loadOwnedFinalComposite(input.supabase, {
        userId: input.userId,
        projectId: input.projectId,
      });
    } catch {
      stored = null;
    }
    if (stored && isValidVideoArtifact(stored.artifact)) {
      await persistTransition(input.supabase, {
        projectId: input.projectId,
        from: "published",
        to: "video_rendered",
        artifact: stored.artifact,
      });
    }
  }

  return {
    publication: unpublished,
    target: publicationToPublishTarget(unpublished),
    reused: false,
    domainState: "video_rendered",
  };
}

export async function loadPublicVideoPage(input: {
  supabase: AnySupabase;
  slug: string;
  origin: string;
}): Promise<
  | { status: 200; html: string; publication: VideoPublicationRecord }
  | { status: 404 | 410; message: string }
> {
  const slug = input.slug.trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]{2,80}$/.test(slug)) {
    return { status: 404, message: "Published video not found." };
  }
  const publication = await loadPublicationBySlug(input.supabase, slug);
  if (!publication) return { status: 404, message: "Published video not found." };
  if (publication.status !== "published") {
    return { status: 410, message: "This video is no longer published." };
  }

  const { data, error } = await input.supabase
    .from("video_media")
    .select("id, storage_path, public_url, mime_type, duration_sec, kind, provider")
    .eq("id", publication.artifactId)
    .maybeSingle();
  if (error || !data) return { status: 404, message: "Published video not found." };

  const mime = String(data.mime_type || publication.mimeType).split(";")[0].trim().toLowerCase();
  if (mime !== "video/mp4" && mime !== "video/webm") {
    return { status: 404, message: "Published video not found." };
  }

  const videoUrl = await signPublicVideoDeliveryUrl({
    supabase: input.supabase,
    storagePath: String(data.storage_path || ""),
    fallbackUrl: (data.public_url as string) || null,
  });
  const pageUrl = `${input.origin.replace(/\/+$/, "")}${publicVideoPath(publication.slug)}`;
  const html = buildPublicVideoHtml({
    title: publication.title,
    description: publication.description,
    pageUrl,
    videoUrl,
    mimeType: mime,
    durationSec: Number(data.duration_sec || publication.durationSec),
  });
  return { status: 200, html, publication };
}
