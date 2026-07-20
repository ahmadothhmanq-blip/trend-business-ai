/**
 * AI Voice & Audio System — tracks, beds, subtitle sync helpers.
 */

import type {
  AiPresenterProfile,
  VideoAudioBed,
  VideoProductionModel,
  VideoVoiceTrack,
} from "@/lib/ai-core/video-production-platform/types";
import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";

export const VOICE_STYLES = [
  "Natural conversational",
  "Motivational energetic",
  "Calm authoritative",
  "Clear instructional",
  "Confident professional",
  "Neutral broadcast",
  "Persuasive warm",
  "Soft aspirational",
  "Warm inviting",
  "Technical confident",
] as const;

export function createDefaultVoiceAndAudio(params: {
  presenter: AiPresenterProfile;
  script: string;
  language: string;
  musicSuggestions?: { name: string; genre: string; mood: string; bpm: string }[];
}): { voiceTracks: VideoVoiceTrack[]; audioBeds: VideoAudioBed[] } {
  const voiceTracks: VideoVoiceTrack[] = [
    {
      id: vid("voice", params.presenter.voiceId, 0),
      voiceId: params.presenter.voiceId,
      style: params.presenter.voiceStyle,
      language: params.language,
      accent: params.presenter.accents[0],
      script: params.script || "",
      status: "queued",
    },
  ];

  const audioBeds: VideoAudioBed[] = (params.musicSuggestions || []).map((m, i) => ({
    id: vid("bed", m.name, i),
    kind: "music" as const,
    name: m.name,
    genre: m.genre,
    mood: m.mood,
    bpm: m.bpm,
    status: "queued" as const,
  }));

  if (audioBeds.length === 0) {
    audioBeds.push({
      id: vid("bed", "ambient", 0),
      kind: "music",
      name: "Ambient Underscore",
      genre: "Ambient",
      mood: "Subtle",
      bpm: "80",
      status: "queued",
    });
  }

  audioBeds.push({
    id: vid("sfx", "whoosh", 0),
    kind: "sfx",
    name: "Transition whoosh",
    status: "queued",
  });

  return { voiceTracks, audioBeds };
}

/**
 * Preview synthesis — marks tracks completed with placeholder assets.
 * Real TTS providers plug in here when API keys exist.
 */
export function synthesizeVoicePreview(
  model: VideoProductionModel,
): VideoProductionModel {
  const updatedAt = nowIso();
  const voiceTracks = model.voiceTracks.map((v) => ({
    ...v,
    status: "completed" as const,
    asset: {
      id: vid("asset", v.voiceId, 0),
      kind: "audio" as const,
      mimeType: "audio/mpeg",
      url: "",
      durationSec: model.targetDurationSec,
      provider: "preview" as const,
      createdAt: updatedAt,
    },
  }));

  const audioBeds = model.audioBeds.map((b) => ({
    ...b,
    status: "completed" as const,
    asset: {
      id: vid("asset", b.name, 0),
      kind: "audio" as const,
      mimeType: "audio/mpeg",
      url: "",
      durationSec: model.targetDurationSec,
      provider: "preview" as const,
      createdAt: updatedAt,
    },
  }));

  return {
    ...model,
    voiceTracks,
    audioBeds,
    updatedAt,
    version: model.version + 1,
  };
}

export function rebuildSubtitlesFromScenes(
  model: VideoProductionModel,
): VideoProductionModel {
  let elapsed = 0;
  const subtitles = model.scenes
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((s) => {
      if (!s.script.trim()) return [];
      const start = elapsed;
      const end = elapsed + s.durationSec;
      elapsed = end;
      return [
        {
          timestamp: `${start}s`,
          text: s.script,
          startSec: start,
          endSec: end,
        },
      ];
    });
  return {
    ...model,
    subtitles,
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export function isTtsConfigured(): boolean {
  return Boolean(
    process.env.ELEVENLABS_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.TTS_PROVIDER_API_KEY,
  );
}
