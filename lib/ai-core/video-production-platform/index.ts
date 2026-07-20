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
  VIDEO_PRESENTER_PERSONAS,
  VIDEO_LOCATIONS,
  VIDEO_CONTENT_TYPES,
} from "@/lib/ai-core/video-production-platform/templates";

export {
  buildPresenterProfile,
  listPresenterProfiles,
  presenterPromptBlock,
} from "@/lib/ai-core/video-production-platform/presenters";

export {
  isExternalVideoProviderConfigured,
  resolveVideoProviderName,
  createRenderJobFromModel,
  processRenderJob,
  startAndProcessRender,
  getLatestJob,
  jobStatusSummary,
} from "@/lib/ai-core/video-production-platform/render-engine";

export {
  getVideoProvider,
  listVideoProviders,
  getConfiguredVideoProviders,
  resolvePreferredProviderId,
  envProviderFlags,
} from "@/lib/ai-core/video-production-platform/providers";

export { runFullRenderPipeline, resumeRenderJob, retryFailedClips, processPendingRenderJobs } from "@/lib/ai-core/video-production-platform/generation-pipeline";

export {
  uploadVideoStudioMedia,
  fetchRemoteToBytes,
  listVideoStudioMedia,
  getVideoStudioMediaPreview,
  deleteVideoStudioMedia,
  purgeGenerationMedia,
  VIDEO_STUDIO_BUCKET,
} from "@/lib/ai-core/video-production-platform/media-storage";

export { assembleComposite } from "@/lib/ai-core/video-production-platform/assemble";

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
  type ImageToVideoInput,
} from "@/lib/ai-core/video-production-platform/image-to-video";

export {
  SOCIAL_EXPORT_PRESETS,
  getSocialExportPreset,
  buildSocialExportPackage,
  buildSocialPublishPackage,
  buildCaptionsVtt,
} from "@/lib/ai-core/video-production-platform/social-export";

export {
  requestAvatarPresenterClip,
  applyAvatarProfileToModel,
} from "@/lib/ai-core/video-production-platform/avatar";
