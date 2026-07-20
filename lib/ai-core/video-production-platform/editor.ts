/**
 * AI Video Editor Foundation — timeline, reorder, script/voice/presenter edits.
 */

import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import {
  reorderScenes,
  updateSceneScript,
  applyPresenterToModel,
} from "@/lib/ai-core/video-production-platform/model-builder";
import { rebuildSubtitlesFromScenes } from "@/lib/ai-core/video-production-platform/voice-audio";
import { nowIso } from "@/lib/ai-core/video-production-platform/ids";
import type { PresenterPersonaId } from "@/lib/ai-core/video-production-platform/types";

export type VideoTimelineState = {
  selectedSceneId: string | null;
  playheadSec: number;
  zoom: number;
};

export function createTimelineState(
  model: VideoProductionModel,
): VideoTimelineState {
  return {
    selectedSceneId: model.scenes[0]?.id ?? null,
    playheadSec: 0,
    zoom: 1,
  };
}

export function editorReorder(
  model: VideoProductionModel,
  sceneIdsInOrder: string[],
): VideoProductionModel {
  return rebuildSubtitlesFromScenes(reorderScenes(model, sceneIdsInOrder));
}

export function editorUpdateScript(
  model: VideoProductionModel,
  sceneId: string,
  script: string,
): VideoProductionModel {
  return rebuildSubtitlesFromScenes(updateSceneScript(model, sceneId, script));
}

export function editorChangePresenter(
  model: VideoProductionModel,
  personaId: PresenterPersonaId,
): VideoProductionModel {
  return applyPresenterToModel(model, personaId);
}

export function editorChangeVoiceStyle(
  model: VideoProductionModel,
  style: string,
): VideoProductionModel {
  return {
    ...model,
    voiceTracks: model.voiceTracks.map((v, i) =>
      i === 0 ? { ...v, style, status: "queued" } : v,
    ),
    presenter: model.presenter
      ? { ...model.presenter, voiceStyle: style }
      : model.presenter,
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export function timelineSummary(model: VideoProductionModel): Array<{
  id: string;
  name: string;
  startSec: number;
  endSec: number;
  hasClip: boolean;
}> {
  let t = 0;
  return [...model.scenes]
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const start = t;
      const end = t + s.durationSec;
      t = end;
      return {
        id: s.id,
        name: s.name,
        startSec: start,
        endSec: end,
        hasClip: Boolean(s.clipId),
      };
    });
}

/** Trim scene duration (seconds). */
export function editorTrimScene(
  model: VideoProductionModel,
  sceneId: string,
  durationSec: number,
): VideoProductionModel {
  const next = Math.max(1, Math.min(600, durationSec));
  return {
    ...model,
    scenes: model.scenes.map((s) =>
      s.id === sceneId ? { ...s, durationSec: next } : s,
    ),
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export function editorReplaceSceneVisual(
  model: VideoProductionModel,
  sceneId: string,
  visualPrompt: string,
): VideoProductionModel {
  return {
    ...model,
    scenes: model.scenes.map((s) =>
      s.id === sceneId ? { ...s, visualPrompt, clipId: undefined } : s,
    ),
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export function editorUpdateSubtitles(
  model: VideoProductionModel,
  subtitles: VideoProductionModel["subtitles"],
): VideoProductionModel {
  return {
    ...model,
    subtitles,
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export function editorReplaceMusic(
  model: VideoProductionModel,
  bed: { name: string; genre?: string; mood?: string; bpm?: string },
): VideoProductionModel {
  const audioBeds = [...model.audioBeds];
  const idx = audioBeds.findIndex((b) => b.kind === "music");
  const next = {
    id: audioBeds[idx]?.id || `bed-${Date.now()}`,
    kind: "music" as const,
    name: bed.name,
    genre: bed.genre,
    mood: bed.mood,
    bpm: bed.bpm,
    status: "queued" as const,
  };
  if (idx >= 0) audioBeds[idx] = next;
  else audioBeds.unshift(next);
  return {
    ...model,
    audioBeds,
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}
