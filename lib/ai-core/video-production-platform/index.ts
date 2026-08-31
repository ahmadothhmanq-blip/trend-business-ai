/**
 * Video Production Platform — public exports (Video Studio only).
 */

export type * from "@/lib/ai-core/video-production-platform/types";

export {
  listVideoTemplates,
  getVideoTemplate,
  listTemplatesByCategory,
  matchVideoTemplate,
  templateCatalogStats,
  searchVideoTemplates,
  listMarketplaceIndustries,
  VIDEO_PRESENTER_PERSONAS,
  VIDEO_LOCATIONS,
  VIDEO_CONTENT_TYPES,
  VIDEO_INDUSTRY_PACKS,
  VIDEO_VISUAL_VARIANTS,
} from "@/lib/ai-core/video-production-platform/templates";

export {
  buildPresenterProfile,
  listPresenterProfiles,
  presenterPromptBlock,
} from "@/lib/ai-core/video-production-platform/presenters";

export {
  isExternalVideoProviderConfigured,
  isKlingVideoProviderConfigured,
  resolveVideoProviderName,
  createRenderJobFromModel,
  processRenderJob,
  startAndProcessRender,
  getLatestJob,
  jobStatusSummary,
} from "@/lib/ai-core/video-production-platform/render-engine";

export {
  getVideoProvider,
  getVideoProviderForMode,
  listVideoProviders,
  getConfiguredVideoProviders,
  resolvePreferredProviderId,
  resolveVideoProviderForMode,
  envProviderFlags,
  isStrictVideoProviderMode,
  isStubVideoBytes,
  ProviderNotConfiguredError,
} from "@/lib/ai-core/video-production-platform/providers";

export { runFullRenderPipeline, resumeRenderJob, retryFailedClips, processPendingRenderJobs, processVideoStudioBackgroundQueue } from "@/lib/ai-core/video-production-platform/generation-pipeline";
export { processDueProviderJobs } from "@/lib/ai-core/video-production-platform/runtime/provider-job-worker";

export {
  uploadVideoStudioMedia,
  fetchRemoteToBytes,
  fetchRemoteVideoToBytes,
  listVideoStudioMedia,
  getVideoStudioMediaPreview,
  deleteVideoStudioMedia,
  purgeGenerationMedia,
  probeVideoStudioStorage,
  VIDEO_STUDIO_BUCKET,
  VIDEO_STUDIO_SIGNED_URL_TTL_SEC,
} from "@/lib/ai-core/video-production-platform/media-storage";

export {
  assembleComposite,
  resolveExportPreset,
  probeFfmpegHealth,
  probeFfmpegCapabilities,
  trimClipWithFfmpeg,
  probeMediaDurationSec,
} from "@/lib/ai-core/video-production-platform/assemble";

export {
  recordMediaRevision,
  revisionsFromRecord,
  type MediaRevision,
} from "@/lib/ai-core/video-production-platform/media-revisions";

export {
  synthesizeSpeech,
  isTtsProviderConfigured,
  resolveTtsProviderId,
  TTS_VOICE_CATALOG,
} from "@/lib/ai-core/video-production-platform/tts";

export {
  buildProductionModelFromOutput,
  reorderScenes,
  updateSceneScript,
  applyPresenterToModel,
} from "@/lib/ai-core/video-production-platform/model-builder";

export {
  DURATION_PRESETS,
  parseDurationToSeconds,
  resolveDurationTier,
  recommendedSceneCount,
  buildChapters,
  assemblyPlan,
} from "@/lib/ai-core/video-production-platform/duration";

export {
  VOICE_STYLES,
  createDefaultVoiceAndAudio,
  synthesizeVoicePreview,
  rebuildSubtitlesFromScenes,
  isTtsConfigured,
} from "@/lib/ai-core/video-production-platform/voice-audio";

export {
  buildProductPresenterBrief,
  type ProductPresenterInput,
} from "@/lib/ai-core/video-production-platform/product-presenter";

export {
  buildEducationalVideoBrief,
  type EducationalVideoInput,
} from "@/lib/ai-core/video-production-platform/educational";

export {
  planBatchVideos,
  batchItemToPluginInput,
  createBatchProgress,
  updateBatchProgressPercent,
  resolveBatchCreditLeaseAction,
  BATCH_PLAN_MAX,
  BATCH_GENERATE_MAX,
  type BatchProgressSnapshot,
} from "@/lib/ai-core/video-production-platform/batch";

export {
  createTimelineState,
  editorReorder,
  editorUpdateScript,
  editorChangePresenter,
  editorChangeVoiceStyle,
  timelineSummary,
  buildVisualTimeline,
  editorNudgeScene,
  editorTrimScene,
  editorReplaceSceneVisual,
  editorUpdateSubtitles,
  editorReplaceMusic,
} from "@/lib/ai-core/video-production-platform/editor";

export {
  applyBrandToVideoModel,
  brandEndCardSvg,
  type VideoBrandKitInput,
} from "@/lib/ai-core/video-production-platform/brand";

export { runVideoQualityChecks } from "@/lib/ai-core/video-production-platform/quality";

export {
  emptyVideoVersionHistory,
  saveVideoVersion,
  restoreVideoVersion,
  type VideoVersionHistory,
} from "@/lib/ai-core/video-production-platform/versions";

export {
  extractProductionModel,
  extractVideoVersionHistory,
  withProductionModel,
  type VideoBlueprintBag,
} from "@/lib/ai-core/video-production-platform/management";

export {
  buildImageToVideoBrief,
  attachSourceImageToModel,
  ingestDirectorSourceImages,
  collectDirectorSourceImageUrls,
  MAX_VIDEO_STUDIO_SOURCE_IMAGES,
  type ImageToVideoInput,
  type VideoStudioSourceImageUpload,
} from "@/lib/ai-core/video-production-platform/image-to-video";

export {
  SOCIAL_EXPORT_PRESETS,
  getSocialExportPreset,
  buildSocialExportPackage,
  buildSocialPublishPackage,
  buildCaptionsVtt,
  persistSocialExportAssets,
  reencodeForSocialPreset,
} from "@/lib/ai-core/video-production-platform/social-export";
export {
  ProductionExportError,
  exportProductionForSocialPreset,
  verifyPlayableCompositeBytes,
  sniffPlayableVideoMime,
} from "@/lib/ai-core/video-production-platform/export-production";
export type {
  VerifiedCompositeArtifact,
  ProductionExportResult,
} from "@/lib/ai-core/video-production-platform/export-production";

export {
  requestAvatarPresenterClip,
  applyAvatarProfileToModel,
} from "@/lib/ai-core/video-production-platform/avatar";

export {
  getVideoStudioEnvCatalog,
  validateVideoStudioProductionEnv,
  isVideoProviderKeyConfigured,
  isFullRenderProviderConfigured,
  isFfmpegPathConfigured,
  isVideoStudioStrictModeConfigured,
  videoStudioProductionRenderBlockReason,
  VIDEO_STUDIO_ENV_DOCS,
} from "@/lib/ai-core/video-production-platform/env-config";

export { buildVideoStudioHealthReport } from "@/lib/ai-core/video-production-platform/production-health";
export { buildProviderHealthReport } from "@/lib/ai-core/video-production-platform/provider-health";
export {
  validateClipMediaForRender,
  filterClipsForProductionAssembly,
  isProductionRenderMode,
  isFfmpegAssemblyMethod,
  isRealProductionClipAsset,
  isPlayableVideoMime,
} from "@/lib/ai-core/video-production-platform/media-validation";
export {
  generationStatusAfterStoryboard,
  generationStatusAfterRenderJob,
  storyboardGeneratedMessage,
  videoRenderedMessage,
} from "@/lib/ai-core/video-production-platform/generation-status";
export {
  VIDEO_PROJECT_STATES,
  PLAYABLE_VIDEO_MIME_TYPES,
  DomainValidationError,
  isValidVideoArtifact,
  canTransition,
  assertValidScene,
  assertValidVideoArtifact,
  assertValidProviderJob,
  assertWritableProjectState,
  isWritableProjectState,
  readProjectFromGeneration,
  readScenesFromBlueprint,
  toWritableGenerationStatus,
  type VideoProject,
  type VideoPlan,
  type Scene,
  type ProviderJob,
  type RenderJob,
  type VideoArtifact,
  type QualityReport,
  type QualityVerdict,
  type PublishTarget,
  type AudioPlan,
} from "@/lib/ai-core/video-production-platform/domain";
export {
  VideoPublishError,
  publishVideoProject,
  unpublishVideoProject,
  loadPublicVideoPage,
  buildPublicVideoHtml,
  publicVideoPath,
} from "@/lib/ai-core/video-production-platform/publish";
export {
  produceAudio,
  resolveTtsProvider,
  mixAudio,
  mixPcmWav,
  AudioEngineError,
  audioProductionPlanFromSource,
  toLegacyAudioPlan,
  isNarrationRequired,
  produceRenderAudio,
} from "@/lib/ai-core/video-production-platform/audio-engine";
export type {
  VoiceTrack,
  MusicTrack,
  SFXTrack,
  AudioArtifact,
  AudioMixJob,
  AudioProductionPlan,
  TtsProvider,
} from "@/lib/ai-core/video-production-platform/audio-engine";
export {
  runLipSync,
  resolveLipSyncProvider,
  heygenLipSyncProvider,
  LipSyncError,
} from "@/lib/ai-core/video-production-platform/lip-sync";
export type { LipSyncProvider, RunLipSyncResult } from "@/lib/ai-core/video-production-platform/lip-sync";
export {
  inspectArtifactQuality,
  canAssembleAfterQuality,
} from "@/lib/ai-core/video-production-platform/quality-control";
export type { ArtifactQualityReport } from "@/lib/ai-core/video-production-platform/quality-control";
export {
  assertTransition,
  persistTransition,
  transition,
} from "@/lib/ai-core/video-production-platform/state-machine";
export {
  runDomainRenderPipeline,
  retryDomainRender,
  resumeDomainRender,
  seedDomainProject,
} from "@/lib/ai-core/video-production-platform/runtime";
export {
  ProviderRouterError,
  createMemoryProviderJobStore,
  createProviderRegistry,
  persistRoutedProviderJob,
  routeModel,
  type ModelRouterDecision,
  type ModelRouterInput,
  type VideoProviderV2,
} from "@/lib/ai-core/video-production-platform/provider-router";
export {
  assertCanPersistArtifact,
  assertCanPersistProjectState,
  buildProviderIdempotencyKey,
  insertPlayableArtifact,
  insertProviderJob,
  insertQualityReport,
  insertVideoPlan,
  insertVideoScenes,
  readProjectWithSceneRows,
  readProjectWithScenes,
  reorderVideoScenes,
  scenesFromDomainOrLegacy,
} from "@/lib/ai-core/video-production-platform/persistence";
export {
  validateVideoStudioUpload,
  VideoStudioUploadError,
  VIDEO_STUDIO_STILL_MAX_BYTES,
  VIDEO_STUDIO_VIDEO_MAX_BYTES,
  VIDEO_STUDIO_UPLOAD_MAX_BYTES,
} from "@/lib/ai-core/video-production-platform/upload-validation";
export {
  activatePlan,
  archivePlan,
  listProjectPlanVersions,
  loadActivePlanScenes,
  PlanVersioningError,
} from "@/lib/ai-core/video-production-platform/plan-versioning";
export type { ActivatePlanResult, PlanVersion } from "@/lib/ai-core/video-production-platform/plan-versioning";
export {
  regenerateScene,
  SceneRegenerationError,
  type RegenerateSceneOptions,
  type RegenerateSceneResult,
} from "@/lib/ai-core/video-production-platform/scene-regeneration";
export {
  runDirector,
  projectDirectorBlueprint,
  directorInputFromGenerateRequest,
  assertDirectorInput,
  assertDirectorPlan,
  hydrateDirectorPlan,
  DirectorError,
  DIRECTOR_ASPECT_RATIOS,
  DIRECTOR_SPEC_VERSION,
} from "@/lib/ai-core/video-production-platform/director";
export type {
  DirectorInput,
  DirectorVideoPlan,
  DirectorScene,
  DirectorResult,
} from "@/lib/ai-core/video-production-platform/director";
