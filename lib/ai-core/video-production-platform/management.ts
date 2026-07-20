/**
 * Extract / persist production model inside video blueprint JSON.
 */

import type { VideoBlueprint } from "@/types/video";
import type { VideoOutput } from "@/plugins/video-studio/types";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import type { VideoVersionHistory } from "@/lib/ai-core/video-production-platform/versions";
import { emptyVideoVersionHistory } from "@/lib/ai-core/video-production-platform/versions";
import { buildProductionModelFromOutput } from "@/lib/ai-core/video-production-platform/model-builder";
import { matchVideoTemplate } from "@/lib/ai-core/video-production-platform/templates";

export type VideoBlueprintBag = VideoBlueprint & {
  productionModel?: VideoProductionModel;
  versionHistory?: VideoVersionHistory;
};

export function extractProductionModel(
  blueprint: unknown,
  fallback?: {
    prompt?: string;
    style?: string;
    aspectRatio?: string;
    duration?: string;
    mood?: string;
    videoType?: string;
  },
): VideoProductionModel {
  const bp = (blueprint || {}) as VideoBlueprintBag;
  if (bp.productionModel?.scenes?.length) return bp.productionModel;

  const output: VideoOutput = {
    title: bp.title || "Untitled Video",
    description: bp.description || "",
    videoType: bp.videoType || fallback?.videoType || "custom",
    style: bp.style || fallback?.style || "Cinematic",
    scenes: (bp.scenes || []).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      visualPrompt: s.visualPrompt,
      cameraMove: s.cameraMove,
      mood: s.mood,
      narration: s.narration,
      musicDirection: s.musicDirection,
      sfxNotes: s.sfxNotes,
      transition: s.transition,
      svgStoryboard: s.svgStoryboard,
    })),
    script: bp.script || "",
    voiceoverScript: bp.voiceoverScript || "",
    musicSuggestions: bp.musicSuggestions || [],
    subtitles: bp.subtitles || [],
    thumbnailSvg: bp.thumbnailSvg || "",
    colorGrade: bp.colorGrade || "",
    files: bp.files || [],
  };

  return buildProductionModelFromOutput({
    output,
    prompt: fallback?.prompt || bp.prompt || bp.description || "",
    aspectRatio: bp.aspectRatio || fallback?.aspectRatio || "16:9",
    duration: bp.totalDuration || fallback?.duration || "30s",
    mood: fallback?.mood || "Professional",
    template: matchVideoTemplate({
      prompt: fallback?.prompt || bp.prompt,
      videoType: output.videoType,
    }),
  });
}

export function extractVideoVersionHistory(blueprint: unknown): VideoVersionHistory {
  const bp = (blueprint || {}) as VideoBlueprintBag;
  if (bp.versionHistory?.versions) return bp.versionHistory;
  return emptyVideoVersionHistory();
}

export function withProductionModel(
  blueprint: VideoBlueprintBag,
  model: VideoProductionModel,
  history?: VideoVersionHistory,
): VideoBlueprintBag {
  return {
    ...blueprint,
    title: model.title || blueprint.title,
    productionModel: model,
    ...(history ? { versionHistory: history } : {}),
  };
}
