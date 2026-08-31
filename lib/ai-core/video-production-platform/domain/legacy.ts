/**
 * Read-only adapters from legacy Video Studio rows / blueprints.
 * Never used to write `completed` or treat SVG storyboards as video artifacts.
 */

import type { VideoBlueprint, VideoGeneration, VideoGenerationStatus, VideoScene } from "@/types/video";
import { parseDurationToSeconds } from "@/lib/ai-core/video-production-platform/duration";
import type {
  Scene,
  VideoProject,
  VideoProjectState,
  VideoWorkflow,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import { assertWritableProjectState } from "@/lib/ai-core/video-production-platform/domain/validation";

export const WORKFLOW_FROM_TYPE: Record<string, VideoWorkflow> = {
  "ad-video": "ad",
  "product-demo": "product",
  "image-to-video": "product",
  "social-video": "social",
  explainer: "explainer",
  "brand-video": "brand",
  trailer: "cinematic",
  storyboard: "cinematic",
  "text-to-video": "cinematic",
  "presentation-video": "explainer",
  ugc: "ugc",
  avatar: "avatar",
  custom: "cinematic",
};

export function readProjectState(status: VideoGenerationStatus | string): VideoProjectState {
  switch (status) {
    case "pending":
      return "draft";
    case "generating":
      return "generating";
    case "storyboard_ready":
      return "storyboard_ready";
    case "video_rendered":
      return "video_rendered";
    case "failed":
      return "failed";
    case "completed":
      return "storyboard_ready";
    default:
      return "draft";
  }
}

/** Maps domain state onto the current generation column. Never returns `completed`. */
export function toWritableGenerationStatus(state: VideoProjectState): Exclude<
  VideoGenerationStatus,
  "completed"
> {
  assertWritableProjectState(state);
  switch (state) {
    case "draft":
    case "planning":
      return "pending";
    case "storyboard_ready":
      return "storyboard_ready";
    case "video_rendered":
    case "published":
      return "video_rendered";
    case "failed":
    case "cancelled":
      return "failed";
    case "generating":
    case "processing":
    case "quality_check":
    case "assembling":
      return "generating";
  }
}

export function readSceneFromLegacy(
  scene: VideoScene,
  projectId: string,
  order: number,
): Scene {
  return {
    id: scene.id,
    projectId,
    order,
    duration: parseDurationToSeconds(scene.duration),
    prompt: scene.visualPrompt || scene.description || scene.name,
    camera: { move: scene.cameraMove || "Static" },
    visualStyle: scene.mood || "Cinematic",
    references: [],
    characters: [],
    products: [],
    dialogue: {
      text: scene.narration || "",
      language: "en",
    },
    audio: {
      musicCue: scene.musicDirection || undefined,
      sfx: scene.sfxNotes ? [scene.sfxNotes] : [],
    },
    transition: scene.transition || "cut",
    providerPreference: "auto",
    fallbackProvider: null,
    status: "planned",
    qualityScore: null,
  };
}

export function readProjectFromGeneration(generation: VideoGeneration): VideoProject {
  const state = readProjectState(generation.status);
  return {
    id: generation.id,
    userId: generation.user_id,
    title: generation.video_name,
    workflow: WORKFLOW_FROM_TYPE[generation.video_type] || "cinematic",
    state,
    planId: null,
    brandId: null,
    language: generation.blueprint?.language || "en",
    aspectRatio: generation.aspect_ratio,
    createdAt: generation.created_at,
    updatedAt: generation.updated_at,
  };
}

export function readScenesFromBlueprint(
  blueprint: VideoBlueprint | null | undefined,
  projectId: string,
): Scene[] {
  return (blueprint?.scenes ?? []).map((scene, index) =>
    readSceneFromLegacy(scene, projectId, index),
  );
}
