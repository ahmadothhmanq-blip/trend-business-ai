/**
 * Frozen Video Studio validation (Phase 1).
 * No I/O, no providers, no API side effects.
 */

import { isStubVideoBytes } from "@/lib/ai-core/video-production-platform/providers/types";
import type {
  ProviderJob,
  Scene,
  TransitionContext,
  VideoArtifact,
  VideoProjectState,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import {
  PLAYABLE_VIDEO_MIME_TYPES,
  PRODUCTION_VIDEO_PROVIDERS,
  SCENE_PROVIDER_PREFERENCES,
  SCENE_STATUSES,
  VIDEO_PROJECT_STATES,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain/errors";

const PLAYABLE = new Set<string>(PLAYABLE_VIDEO_MIME_TYPES);

const ALLOWED_TRANSITIONS: Record<VideoProjectState, readonly VideoProjectState[]> = {
  draft: ["planning", "cancelled", "failed"],
  planning: ["storyboard_ready", "failed", "cancelled"],
  storyboard_ready: ["generating", "planning", "failed", "cancelled"],
  generating: ["processing", "failed", "cancelled"],
  processing: ["quality_check", "failed", "cancelled"],
  quality_check: ["assembling", "generating", "failed", "cancelled"],
  assembling: ["video_rendered", "failed", "cancelled"],
  video_rendered: ["published", "generating", "failed"],
  published: ["generating", "video_rendered"],
  failed: ["generating", "planning", "cancelled"],
  cancelled: ["draft", "planning"],
};

function normalizeMime(mime?: string | null): string {
  return (mime || "").split(";")[0].trim().toLowerCase();
}

function looksLikeSvg(artifact: Pick<VideoArtifact, "mimeType" | "url" | "bytes">): boolean {
  const mime = normalizeMime(artifact.mimeType);
  if (mime.includes("svg") || mime === "image/svg+xml" || mime === "text/html") return true;
  const url = (artifact.url || "").toLowerCase();
  if (url.startsWith("data:image/svg") || url.includes("image/svg+xml") || url.endsWith(".svg")) {
    return true;
  }
  if (!artifact.bytes || artifact.bytes.byteLength === 0) return false;
  const head = Buffer.from(artifact.bytes.subarray(0, 256)).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  return head.startsWith("<svg") || head.includes("<svg") || /<script[\s>]/i.test(head);
}

function bytesLookLikePlayableVideo(bytes: Uint8Array, mime: string): boolean {
  if (bytes.byteLength < 12) return false;
  if (isStubVideoBytes(bytes)) return false;
  if (mime === "video/mp4") {
    return Buffer.from(bytes.subarray(4, 8)).toString("ascii") === "ftyp";
  }
  if (mime === "video/webm") {
    return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  return false;
}

export function isWritableProjectState(state: string): state is VideoProjectState {
  return (VIDEO_PROJECT_STATES as readonly string[]).includes(state);
}

export function assertWritableProjectState(state: string): asserts state is VideoProjectState {
  if (state === "completed" || state === "pending") {
    throw new DomainValidationError(
      `Legacy status "${state}" cannot be written for new Video Studio projects.`,
    );
  }
  if (!isWritableProjectState(state)) {
    throw new DomainValidationError(`Invalid project state "${state}".`);
  }
}

export function isValidVideoArtifact(artifact: VideoArtifact | null | undefined): boolean {
  if (!artifact) return false;
  if (artifact.isStub) return false;
  const provider = (artifact.provider || "").toLowerCase();
  if (provider === "preview" || provider === "preview-stub") return false;
  if (!artifact.url?.trim()) return false;
  if (!(artifact.durationSec > 0) || !Number.isFinite(artifact.durationSec)) return false;
  if (looksLikeSvg(artifact)) return false;

  const mime = normalizeMime(artifact.mimeType);
  if (!PLAYABLE.has(mime)) return false;

  if (artifact.bytes && artifact.bytes.byteLength > 0) {
    if (!bytesLookLikePlayableVideo(artifact.bytes, mime)) return false;
  }

  return true;
}

export function assertValidVideoArtifact(
  artifact: VideoArtifact | null | undefined,
): asserts artifact is VideoArtifact {
  if (!isValidVideoArtifact(artifact)) {
    throw new DomainValidationError(
      "Video artifact must be a playable video/mp4 or video/webm file with duration > 0. SVG/preview/stubs are not video artifacts.",
    );
  }
}

export function canTransition(
  from: string,
  to: string,
  context: TransitionContext = {},
): boolean {
  if (from === "completed" || from === "pending" || to === "completed" || to === "pending") {
    return false;
  }
  if (!isWritableProjectState(from) || !isWritableProjectState(to)) {
    return false;
  }
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    return false;
  }
  if (to === "video_rendered" && !isValidVideoArtifact(context.artifact)) {
    return false;
  }
  if (from === "quality_check" && to === "assembling" && context.qcVerdict === "BLOCKED") {
    return false;
  }
  if (to === "published") {
    if (from !== "video_rendered") return false;
    if (!isValidVideoArtifact(context.artifact)) return false;
  }
  return true;
}

export function assertValidScene(scene: Scene): void {
  if (!scene.id?.trim()) {
    throw new DomainValidationError("Scene id is required.");
  }
  if (!scene.projectId?.trim()) {
    throw new DomainValidationError("Scene projectId is required.");
  }
  if (!Number.isInteger(scene.order) || scene.order < 0) {
    throw new DomainValidationError("Scene order must be a non-negative integer.");
  }
  if (!(scene.duration > 0) || !Number.isFinite(scene.duration)) {
    throw new DomainValidationError("Scene duration must be greater than 0.");
  }
  if (!scene.prompt || scene.prompt.trim().length < 3) {
    throw new DomainValidationError("Scene prompt is required.");
  }
  if (!scene.camera?.move?.trim()) {
    throw new DomainValidationError("Scene camera.move is required.");
  }
  if (!scene.visualStyle?.trim()) {
    throw new DomainValidationError("Scene visualStyle is required.");
  }
  if (!Array.isArray(scene.references)) {
    throw new DomainValidationError("Scene references must be an array.");
  }
  if (!Array.isArray(scene.characters) || !Array.isArray(scene.products)) {
    throw new DomainValidationError("Scene characters and products must be arrays.");
  }
  if (!scene.dialogue || typeof scene.dialogue.text !== "string" || !scene.dialogue.language?.trim()) {
    throw new DomainValidationError("Scene dialogue.text and dialogue.language are required.");
  }
  if (!scene.audio) {
    throw new DomainValidationError("Scene audio is required.");
  }
  if (scene.audio.sfx != null && !Array.isArray(scene.audio.sfx)) {
    throw new DomainValidationError("Scene audio.sfx must be an array when provided.");
  }
  if (!scene.transition?.trim()) {
    throw new DomainValidationError("Scene transition is required.");
  }
  if (!(SCENE_PROVIDER_PREFERENCES as readonly string[]).includes(scene.providerPreference)) {
    throw new DomainValidationError("Scene providerPreference is invalid.");
  }
  if (scene.providerPreference === ("preview" as string)) {
    throw new DomainValidationError("Preview cannot be a scene provider preference.");
  }
  if (
    scene.fallbackProvider != null &&
    !(PRODUCTION_VIDEO_PROVIDERS as readonly string[]).includes(scene.fallbackProvider)
  ) {
    throw new DomainValidationError("Scene fallbackProvider is invalid.");
  }
  if (!(SCENE_STATUSES as readonly string[]).includes(scene.status)) {
    throw new DomainValidationError("Scene status is invalid.");
  }
  if (
    scene.qualityScore != null &&
    (!Number.isFinite(scene.qualityScore) || scene.qualityScore < 0 || scene.qualityScore > 100)
  ) {
    throw new DomainValidationError("Scene qualityScore must be 0–100 or null.");
  }
  if (scene.status === "ready" && !scene.artifactId?.trim()) {
    throw new DomainValidationError("Scene status ready requires a playable artifactId.");
  }
}

export function assertValidProviderJob(job: ProviderJob): void {
  if (!job.id?.trim() || !job.projectId?.trim() || !job.sceneId?.trim()) {
    throw new DomainValidationError("ProviderJob id, projectId, and sceneId are required.");
  }
  if (!(PRODUCTION_VIDEO_PROVIDERS as readonly string[]).includes(job.provider)) {
    throw new DomainValidationError("ProviderJob provider must be a production video provider.");
  }
  if (job.provider === ("preview" as string)) {
    throw new DomainValidationError("Preview is not a valid production ProviderJob provider.");
  }
  if (!Number.isInteger(job.attempt) || job.attempt < 1) {
    throw new DomainValidationError("ProviderJob attempt must be an integer >= 1.");
  }
  const key = job.idempotencyKey?.trim() ?? "";
  if (key.length < 8) {
    throw new DomainValidationError("ProviderJob idempotencyKey is required.");
  }
  const parts = key.split(":");
  if (parts.length < 4 || parts.some((part) => !part.trim())) {
    throw new DomainValidationError(
      "ProviderJob idempotencyKey must be projectId:sceneId:provider:promptHash.",
    );
  }
  if (parts[0] !== job.projectId || parts[1] !== job.sceneId || parts[2] !== job.provider) {
    throw new DomainValidationError(
      "ProviderJob idempotencyKey must match projectId, sceneId, and provider.",
    );
  }
}

export { ALLOWED_TRANSITIONS };
