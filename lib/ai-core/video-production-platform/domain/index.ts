export type {
  AudioPlan,
  BrandReference,
  Character,
  PlayableVideoMimeType,
  Product,
  ProductionVideoProvider,
  ProviderJob,
  ProviderJobStatus,
  PublishTarget,
  PublishPlatform,
  PublishTargetStatus,
  QualityReport,
  QualityVerdict,
  RenderJob,
  Scene,
  SceneAudio,
  SceneCamera,
  SceneDialogue,
  SceneEditorState,
  SceneTextOverlay,
  SceneProviderPreference,
  SceneReference,
  SceneStatus,
  TransitionContext,
  VideoArtifact,
  VideoPlan,
  VideoProject,
  VideoProjectState,
  VideoPlanStatus,
  VideoWorkflow,
} from "@/lib/ai-core/video-production-platform/domain/contracts";

export {
  LEGACY_GENERATION_STATUSES,
  PLAYABLE_VIDEO_MIME_TYPES,
  PRODUCTION_VIDEO_PROVIDERS,
  PROVIDER_JOB_STATUSES,
  SCENE_PROVIDER_PREFERENCES,
  SCENE_STATUSES,
  VIDEO_PROJECT_STATES,
  VIDEO_WORKFLOWS,
  VIDEO_PLAN_STATUSES,
  PUBLISH_PLATFORMS,
  PUBLISH_TARGET_STATUSES,
} from "@/lib/ai-core/video-production-platform/domain/contracts";

export { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain/errors";

export {
  ALLOWED_TRANSITIONS,
  assertValidProviderJob,
  assertValidScene,
  assertValidVideoArtifact,
  assertWritableProjectState,
  canTransition,
  isValidVideoArtifact,
  isWritableProjectState,
} from "@/lib/ai-core/video-production-platform/domain/validation";

export {
  readProjectFromGeneration,
  readProjectState,
  readSceneFromLegacy,
  readScenesFromBlueprint,
  toWritableGenerationStatus,
  WORKFLOW_FROM_TYPE,
} from "@/lib/ai-core/video-production-platform/domain/legacy";

export type {
  AudioArtifact,
  AudioJobKind,
  AudioJobStatus,
  AudioMixJob,
  AudioProductionPlan,
  AudioTrackKind,
  MusicTrack,
  PlayableAudioMimeType,
  SFXTrack,
  TtsProviderId,
  VoiceTrack,
} from "@/lib/ai-core/video-production-platform/domain/audio";

export {
  AUDIO_JOB_KINDS,
  AUDIO_JOB_STATUSES,
  AUDIO_TRACK_KINDS,
  PLAYABLE_AUDIO_MIME_TYPES,
  TTS_PROVIDER_IDS,
} from "@/lib/ai-core/video-production-platform/domain/audio";
