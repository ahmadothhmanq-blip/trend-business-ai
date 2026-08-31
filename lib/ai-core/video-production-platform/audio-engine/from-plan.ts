import { randomUUID } from "node:crypto";
import type { AudioPlan } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type {
  AudioProductionPlan,
  MusicTrack,
  SFXTrack,
  VoiceTrack,
} from "@/lib/ai-core/video-production-platform/domain/audio";

export type AudioPlanSource = {
  id?: string;
  projectId: string;
  planId?: string | null;
  language: string;
  voiceScript: string;
  targetDurationSec: number;
  speaker?: string;
  tone?: string;
  musicCue?: string;
  musicMood?: string;
  musicStyle?: string;
  sfx?: Array<string | { cue: string; timestampSec?: number; durationSec?: number; intensity?: number }>;
};

export function audioProductionPlanFromSource(source: AudioPlanSource): AudioProductionPlan {
  const audioPlanId = source.id || randomUUID();
  const duration = Math.max(1, source.targetDurationSec);
  const voiceTracks: VoiceTrack[] = source.voiceScript.trim()
    ? [
        {
          id: randomUUID(),
          projectId: source.projectId,
          audioPlanId,
          speaker: source.speaker || "presenter",
          language: source.language,
          tone: source.tone || "professional",
          script: source.voiceScript.trim(),
          startSec: 0,
          durationSec: duration,
          provider: null,
          status: "queued",
        },
      ]
    : [];

  const musicTracks: MusicTrack[] =
    source.musicCue || source.musicMood
      ? [
          {
            id: randomUUID(),
            projectId: source.projectId,
            audioPlanId,
            mood: source.musicMood || source.musicCue || "cinematic",
            durationSec: duration,
            style: source.musicStyle || "cinematic",
            provider: null,
            status: "queued",
          },
        ]
      : [];

  const sfxTracks: SFXTrack[] = (source.sfx || []).map((entry, index) => {
    const cue = typeof entry === "string" ? entry : entry.cue;
    const timestampSec = typeof entry === "string" ? Math.min(duration - 0.2, index * 1.5) : entry.timestampSec ?? 0;
    const durationSec = typeof entry === "string" ? 0.4 : entry.durationSec ?? 0.4;
    const intensity = typeof entry === "string" ? 0.8 : entry.intensity ?? 0.8;
    return {
      id: randomUUID(),
      projectId: source.projectId,
      audioPlanId,
      cue,
      timestampSec,
      durationSec,
      intensity,
      status: "queued" as const,
    };
  });

  return {
    id: audioPlanId,
    projectId: source.projectId,
    planId: source.planId ?? null,
    language: source.language,
    voiceScript: source.voiceScript,
    targetDurationSec: duration,
    voiceTracks,
    musicTracks,
    sfxTracks,
  };
}

export function audioProductionPlanFromLegacy(legacy: AudioPlan, targetDurationSec: number): AudioProductionPlan {
  return audioProductionPlanFromSource({
    id: legacy.id,
    projectId: legacy.projectId,
    language: legacy.language,
    voiceScript: legacy.voiceScript,
    targetDurationSec,
    musicCue: legacy.musicCue,
    sfx: legacy.sfx,
  });
}

export function toLegacyAudioPlan(plan: AudioProductionPlan): AudioPlan {
  return {
    id: plan.id,
    projectId: plan.projectId,
    language: plan.language,
    voiceScript: plan.voiceScript,
    musicCue: plan.musicTracks[0]?.mood,
    sfx: plan.sfxTracks.map((track) => track.cue),
  };
}
