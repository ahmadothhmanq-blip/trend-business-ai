import type { VideoGenerationStatus } from "@/types/video";
import type { VideoRenderJob } from "@/lib/ai-core/video-production-platform/types";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import { toWritableGenerationStatus } from "@/lib/ai-core/video-production-platform/domain/legacy";

export const STORYBOARD_READY_STATUS: VideoGenerationStatus = "storyboard_ready";
export const VIDEO_RENDERED_STATUS: VideoGenerationStatus = "video_rendered";

export function isPlayableVideoArtifact(input: {
  mime?: string | null;
  url?: string | null;
  isStub?: boolean;
  durationSec?: number | null;
  provider?: string | null;
}): boolean {
  return isValidVideoArtifact({
    id: "compat",
    projectId: "compat",
    kind: "composite",
    mimeType: input.mime || "",
    url: input.url || "",
    durationSec: input.durationSec ?? 0,
    provider: input.provider || "",
    isStub: input.isStub,
  });
}

export function generationStatusAfterStoryboard(): VideoGenerationStatus {
  return toWritableGenerationStatus("storyboard_ready");
}

/** Preview / SVG jobs never promote a generation to video_rendered. */
export function generationStatusAfterRenderJob(
  job: Pick<VideoRenderJob, "mode" | "status" | "provider"> & {
    composite?: {
      mimeType?: string;
      url?: string;
      isStub?: boolean;
      durationSec?: number;
    } | null;
    clips?: Array<{
      mimeType?: string;
      url?: string;
      isStub?: boolean;
      durationSec?: number;
    }>;
  },
): VideoGenerationStatus {
  if (job.mode === "preview" || job.provider === "preview") {
    return toWritableGenerationStatus("storyboard_ready");
  }

  const playable = isPlayableVideoArtifact({
    mime: job.composite?.mimeType,
    url: job.composite?.url,
    isStub: job.composite?.isStub,
    durationSec: job.composite?.durationSec,
    provider: job.provider,
  });

  if (job.status === "completed" && playable) {
    return toWritableGenerationStatus("video_rendered");
  }

  return toWritableGenerationStatus("storyboard_ready");
}

export function storyboardGeneratedMessage(): string {
  return "Storyboard generated. No playable video yet — run Full render after a video provider is configured.";
}

export function videoRenderedMessage(): string {
  return "Playable video rendered.";
}
