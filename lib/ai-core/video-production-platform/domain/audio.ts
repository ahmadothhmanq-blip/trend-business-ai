/**
 * Audio domain contracts (Phase 7). Additive — does not replace legacy AudioPlan.
 */

export const AUDIO_TRACK_KINDS = ["voice", "music", "sfx"] as const;
export type AudioTrackKind = (typeof AUDIO_TRACK_KINDS)[number];

export const AUDIO_JOB_KINDS = ["tts", "music", "sfx", "mix"] as const;
export type AudioJobKind = (typeof AUDIO_JOB_KINDS)[number];

export const AUDIO_JOB_STATUSES = [
  "queued",
  "submitted",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
] as const;
export type AudioJobStatus = (typeof AUDIO_JOB_STATUSES)[number];

export const PLAYABLE_AUDIO_MIME_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg"] as const;
export type PlayableAudioMimeType = (typeof PLAYABLE_AUDIO_MIME_TYPES)[number];

export const TTS_PROVIDER_IDS = ["elevenlabs", "openai"] as const;
export type TtsProviderId = (typeof TTS_PROVIDER_IDS)[number];

export type VoiceTrack = {
  id: string;
  projectId: string;
  audioPlanId: string;
  speaker: string;
  language: string;
  tone: string;
  script: string;
  startSec: number;
  durationSec: number;
  provider: TtsProviderId | null;
  artifactId?: string | null;
  status: AudioJobStatus;
};

export type MusicTrack = {
  id: string;
  projectId: string;
  audioPlanId: string;
  mood: string;
  durationSec: number;
  style: string;
  provider: string | null;
  artifactId?: string | null;
  status: AudioJobStatus;
};

export type SFXTrack = {
  id: string;
  projectId: string;
  audioPlanId: string;
  cue: string;
  timestampSec: number;
  durationSec: number;
  intensity: number;
  artifactId?: string | null;
  status: AudioJobStatus;
};

export type AudioArtifact = {
  id: string;
  projectId: string;
  userId: string;
  kind: AudioTrackKind | "mix";
  mimeType: PlayableAudioMimeType;
  url: string;
  durationSec: number;
  sizeBytes: number;
  sha256: string;
  provider: string;
  isStub?: boolean;
  bytes?: Uint8Array | null;
};

export type AudioMixJob = {
  id: string;
  projectId: string;
  audioPlanId: string;
  status: AudioJobStatus;
  voiceLevel: number;
  musicLevel: number;
  sfxLevel: number;
  ducking: boolean;
  normalize: boolean;
  fadeInSec: number;
  fadeOutSec: number;
  targetDurationSec: number;
  artifactId?: string | null;
  idempotencyKey: string;
  attempt: number;
  estimatedCost: number | null;
  actualCost: number | null;
};

export type AudioProductionPlan = {
  id: string;
  projectId: string;
  planId: string | null;
  language: string;
  voiceScript: string;
  targetDurationSec: number;
  voiceTracks: VoiceTrack[];
  musicTracks: MusicTrack[];
  sfxTracks: SFXTrack[];
};
