import { nowIso } from "@/lib/ai-core/video-production-platform/ids";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type { VideoMediaAsset, VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import type { AudioPlanSource } from "@/lib/ai-core/video-production-platform/audio-engine/from-plan";
import {
  produceAudio,
  type ProduceAudioInput,
  type ProduceAudioResult,
} from "@/lib/ai-core/video-production-platform/audio-engine/service";
import { fetchRemoteToBytes } from "@/lib/ai-core/video-production-platform/media-storage";

export function isNarrationRequired(model: VideoProductionModel, scenes: Scene[]): boolean {
  if (model.voiceTracks.some((track) => Boolean(track.script?.trim()))) return true;
  if (scenes.some((scene) => scene.voiceRequired || scene.audio?.voiceRequired)) return true;
  return false;
}

export function voiceScriptFromRender(model: VideoProductionModel, scenes: Scene[]): string {
  const fromTracks = model.voiceTracks.map((track) => track.script).filter((text) => text?.trim()).join("\n");
  if (fromTracks.trim()) return fromTracks.trim();
  const fromScenes = scenes
    .filter((scene) => scene.voiceRequired || scene.audio?.voiceRequired)
    .map((scene) => scene.dialogue?.text)
    .filter((text) => text?.trim())
    .join("\n");
  if (fromScenes.trim()) return fromScenes.trim();
  return model.scenes.map((scene) => scene.script).filter((text) => text?.trim()).join("\n\n").trim();
}

export function buildRenderAudioSource(input: {
  projectId: string;
  planId?: string | null;
  model: VideoProductionModel;
  scenes: Scene[];
}): AudioPlanSource {
  const targetDurationSec = Math.max(
    1,
    input.model.targetDurationSec || input.scenes.reduce((sum, scene) => sum + (scene.duration || 0), 0) || 8,
  );
  const voice = input.model.voiceTracks[0];
  const music = input.model.audioBeds.find((bed) => bed.kind === "music");
  const sfxBeds = input.model.audioBeds.filter((bed) => bed.kind === "sfx");
  const sceneSfx = input.scenes.flatMap((scene) => scene.audio?.sfx || []);
  return {
    projectId: input.projectId,
    planId: input.planId ?? null,
    language: input.model.language || "en",
    voiceScript: voiceScriptFromRender(input.model, input.scenes),
    targetDurationSec,
    speaker: voice?.voiceId || input.model.presenter?.voiceId,
    tone: voice?.style || "professional",
    musicMood: music?.mood,
    musicStyle: music?.genre || music?.mood,
    sfx: sfxBeds.length ? sfxBeds.map((bed) => bed.name) : sceneSfx,
  };
}

export function audioArtifactToMediaAsset(artifact: {
  id: string;
  mimeType: string;
  url: string;
  durationSec: number;
  provider: string;
  bytes?: Uint8Array | null;
}): VideoMediaAsset {
  let url = artifact.url;
  if (artifact.bytes?.byteLength && !url.startsWith("data:")) {
    url = `data:${artifact.mimeType};base64,${Buffer.from(artifact.bytes).toString("base64")}`;
  }
  return {
    id: artifact.id,
    kind: "audio",
    mimeType: artifact.mimeType,
    url,
    durationSec: artifact.durationSec,
    provider: artifact.provider,
    createdAt: nowIso(),
  };
}

async function bytesFromBed(url?: string | null): Promise<Uint8Array | null> {
  if (!url?.trim()) return null;
  return fetchRemoteToBytes(url);
}

export async function produceRenderAudio(input: {
  supabase: ProduceAudioInput["supabase"];
  userId: string;
  projectId: string;
  planId?: string | null;
  model: VideoProductionModel;
  scenes: Scene[];
  tts?: ProduceAudioInput["tts"];
  mixFn?: ProduceAudioInput["mixFn"];
  musicBytes?: Uint8Array | null;
  sfxSources?: ProduceAudioInput["sfxSources"];
}): Promise<ProduceAudioResult> {
  const source = buildRenderAudioSource({
    projectId: input.projectId,
    planId: input.planId,
    model: input.model,
    scenes: input.scenes,
  });
  const musicBytes =
    input.musicBytes ||
    (await bytesFromBed(input.model.audioBeds.find((bed) => bed.kind === "music")?.asset?.url));
  if (!musicBytes) {
    source.musicCue = undefined;
    source.musicMood = undefined;
    source.musicStyle = undefined;
  } else if (!source.musicMood && !source.musicCue) {
    source.musicMood = "cinematic";
  }
  const sfxSources =
    input.sfxSources ||
    (
      await Promise.all(
        input.model.audioBeds
          .filter((bed) => bed.kind === "sfx")
          .map(async (bed) => {
            const bytes = await bytesFromBed(bed.asset?.url);
            return bytes ? { cue: bed.name, bytes } : null;
          }),
      )
    ).filter((row): row is { cue: string; bytes: Uint8Array } => Boolean(row));
  if (!sfxSources.length) source.sfx = [];

  return produceAudio({
    supabase: input.supabase,
    userId: input.userId,
    source,
    tts: input.tts,
    mixFn: input.mixFn,
    musicBytes,
    sfxSources,
    mix: { targetDurationSec: source.targetDurationSec, ducking: true, normalize: true },
  });
}
