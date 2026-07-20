/**
 * Build / mutate VideoProductionModel from templates + generation output.
 */

import type { VideoOutput } from "@/plugins/video-studio/types";
import type {
  VideoBrandOverlay,
  VideoChapter,
  VideoEditorScene,
  VideoProductionModel,
  VideoTemplateDefinition,
} from "@/lib/ai-core/video-production-platform/types";
import { matchVideoTemplate } from "@/lib/ai-core/video-production-platform/templates";
import { buildPresenterProfile } from "@/lib/ai-core/video-production-platform/presenters";
import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";
import {
  parseDurationToSeconds,
  resolveDurationTier,
  buildChapters,
} from "@/lib/ai-core/video-production-platform/duration";
import { createDefaultVoiceAndAudio } from "@/lib/ai-core/video-production-platform/voice-audio";

export function buildProductionModelFromOutput(params: {
  output: VideoOutput;
  prompt: string;
  aspectRatio: string;
  duration: string;
  mood: string;
  language?: string;
  template?: VideoTemplateDefinition;
  brand?: VideoBrandOverlay;
  productImageUrl?: string | null;
}): VideoProductionModel {
  const template =
    params.template ||
    matchVideoTemplate({
      prompt: params.prompt,
      videoType: params.output.videoType,
    });

  const targetDurationSec = parseDurationToSeconds(params.duration);
  const scenes: VideoEditorScene[] = params.output.scenes.map((s, i) => ({
    id: s.id || vid("scene", s.name, i),
    name: s.name,
    order: i,
    durationSec: parseDurationToSeconds(s.duration) || Math.max(3, Math.round(targetDurationSec / Math.max(1, params.output.scenes.length))),
    script: s.narration,
    visualPrompt: enrichVisualPrompt(s.visualPrompt, template),
    cameraMove: s.cameraMove,
    presenterId: undefined,
    voiceId: undefined,
    transition: s.transition,
    svgStoryboard: s.svgStoryboard,
  }));

  const presenter = buildPresenterProfile(template.presenterPersona, {
    language: params.language || "English",
  });
  scenes.forEach((s) => {
    s.presenterId = presenter.id;
  });

  const { voiceTracks, audioBeds } = createDefaultVoiceAndAudio({
    presenter,
    script: params.output.voiceoverScript || params.output.script,
    musicSuggestions: params.output.musicSuggestions,
    language: params.language || "English",
  });

  const chapters = buildChapters(scenes, targetDurationSec);
  const now = nowIso();

  return {
    version: 1,
    title: params.output.title,
    videoType: params.output.videoType,
    templateId: template.id,
    aspectRatio: params.aspectRatio,
    targetDurationSec,
    durationTier: resolveDurationTier(targetDurationSec),
    language: params.language || "English",
    style: params.output.style,
    mood: params.mood,
    presenter,
    locationId: template.location,
    contentTypeId: template.contentType,
    brand: params.brand,
    scenes,
    chapters,
    voiceTracks,
    audioBeds,
    subtitles: params.output.subtitles,
    jobs: [],
    assets: [],
    productImageUrl: params.productImageUrl ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

function enrichVisualPrompt(
  base: string,
  template: VideoTemplateDefinition,
): string {
  return [
    base,
    `Character: ${template.character}`,
    `Environment: ${template.environment}`,
    `Camera: ${template.cameraStyle}`,
    `Motion: ${template.motionStyle}`,
    `Visual style: ${template.visualStyle}`,
  ]
    .filter(Boolean)
    .join(". ");
}

export function reorderScenes(
  model: VideoProductionModel,
  sceneIdsInOrder: string[],
): VideoProductionModel {
  const map = new Map(model.scenes.map((s) => [s.id, s]));
  const scenes = sceneIdsInOrder
    .map((id, order) => {
      const s = map.get(id);
      return s ? { ...s, order } : null;
    })
    .filter((s): s is VideoEditorScene => Boolean(s));
  // append any missing
  for (const s of model.scenes) {
    if (!scenes.find((x) => x.id === s.id)) {
      scenes.push({ ...s, order: scenes.length });
    }
  }
  return {
    ...model,
    scenes,
    chapters: buildChapters(scenes, model.targetDurationSec),
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export function updateSceneScript(
  model: VideoProductionModel,
  sceneId: string,
  script: string,
): VideoProductionModel {
  return {
    ...model,
    scenes: model.scenes.map((s) =>
      s.id === sceneId ? { ...s, script } : s,
    ),
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export function applyPresenterToModel(
  model: VideoProductionModel,
  personaId: Parameters<typeof buildPresenterProfile>[0],
): VideoProductionModel {
  const presenter = buildPresenterProfile(personaId, {
    language: model.language,
  });
  return {
    ...model,
    presenter,
    scenes: model.scenes.map((s) => ({ ...s, presenterId: presenter.id })),
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export type { VideoChapter };
