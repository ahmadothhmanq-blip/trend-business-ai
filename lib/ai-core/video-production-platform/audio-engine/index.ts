export { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";
export {
  assertAudioOwnership,
  assertValidAudioBytes,
  buildAudioIdempotencyKey,
  isSilentPreviewWav,
  isValidAudioArtifact,
  sniffAudioMime,
} from "@/lib/ai-core/video-production-platform/audio-engine/validation";
export {
  alignDuration,
  applyFade,
  duckMusic,
  mixAudio,
  mixPcmWav,
  pcmFromWav,
  toneWavBytes,
  wavFromPcm,
  type MixInput,
  type MixResult,
  type MixSettings,
} from "@/lib/ai-core/video-production-platform/audio-engine/mixer";
export {
  listTtsProviders,
  resolveTtsProvider,
  ttsProviderHealthReport,
} from "@/lib/ai-core/video-production-platform/audio-engine/tts/registry";
export type {
  TtsCapabilities,
  TtsCostEstimate,
  TtsHealth,
  TtsJobHandle,
  TtsJobRequest,
  TtsProvider,
  TtsProviderStatus,
} from "@/lib/ai-core/video-production-platform/audio-engine/tts/contract";
export {
  audioProductionPlanFromLegacy,
  audioProductionPlanFromSource,
  toLegacyAudioPlan,
  type AudioPlanSource,
} from "@/lib/ai-core/video-production-platform/audio-engine/from-plan";
export { produceAudio, signAudioArtifactUrl } from "@/lib/ai-core/video-production-platform/audio-engine/service";
export {
  audioArtifactToMediaAsset,
  isNarrationRequired,
  produceRenderAudio,
} from "@/lib/ai-core/video-production-platform/audio-engine/render-lane";
export {
  findAudioJobByIdempotencyKey,
  insertAudioJob,
  listAudioJobsForProject,
  loadAudioArtifact,
  persistAudioArtifact,
} from "@/lib/ai-core/video-production-platform/audio-engine/persist";
export type { AudioJobRecord } from "@/lib/ai-core/video-production-platform/audio-engine/persist";
export type {
  AudioArtifact,
  AudioMixJob,
  AudioProductionPlan,
  MusicTrack,
  SFXTrack,
  VoiceTrack,
} from "@/lib/ai-core/video-production-platform/domain/audio";
