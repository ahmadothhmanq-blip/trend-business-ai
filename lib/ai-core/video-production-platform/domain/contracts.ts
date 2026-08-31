/**
 * Frozen Video Studio domain contracts (Phase 1).
 * These types are the source of truth for future DB/API work.
 * Legacy VideoBlueprint / VideoProductionModel remain read-compatible only.
 */

export const VIDEO_PROJECT_STATES = [
  "draft",
  "planning",
  "storyboard_ready",
  "generating",
  "processing",
  "quality_check",
  "assembling",
  "video_rendered",
  "published",
  "failed",
  "cancelled",
] as const;

export type VideoProjectState = (typeof VIDEO_PROJECT_STATES)[number];

/** Persisted API/DB statuses that may still appear on old rows. Not writable for new projects. */
export const LEGACY_GENERATION_STATUSES = ["pending", "completed"] as const;
export type LegacyGenerationStatus = (typeof LEGACY_GENERATION_STATUSES)[number];

export const VIDEO_WORKFLOWS = [
  "cinematic",
  "ad",
  "product",
  "ugc",
  "avatar",
  "explainer",
  "social",
  "campaign",
  "brand",
  "dubbing",
] as const;

export type VideoWorkflow = (typeof VIDEO_WORKFLOWS)[number];

export const PRODUCTION_VIDEO_PROVIDERS = [
  "veo",
  "omni_flash",
  "kling",
  "runway",
  "heygen",
  "external",
] as const;

export type ProductionVideoProvider = (typeof PRODUCTION_VIDEO_PROVIDERS)[number];

export const SCENE_PROVIDER_PREFERENCES = [
  "veo",
  "omni_flash",
  "kling",
  "runway",
  "heygen",
  "auto",
] as const;

export type SceneProviderPreference = (typeof SCENE_PROVIDER_PREFERENCES)[number];

export const PLAYABLE_VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;
export type PlayableVideoMimeType = (typeof PLAYABLE_VIDEO_MIME_TYPES)[number];

export const SCENE_STATUSES = [
  "draft",
  "planned",
  "generating",
  "processing",
  "quality_check",
  "ready",
  "failed",
  "cancelled",
] as const;

export type SceneStatus = (typeof SCENE_STATUSES)[number];

export const PROVIDER_JOB_STATUSES = [
  "queued",
  "submitted",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type ProviderJobStatus = (typeof PROVIDER_JOB_STATUSES)[number];

export type SceneReference = {
  kind: "image" | "video" | "brand" | "product";
  uri: string;
  role: string;
};

export type SceneCamera = {
  move: string;
  shotSize?: string;
  lens?: string;
  purpose?: string;
  environment?: string;
  lighting?: string;
};

export type SceneDialogue = {
  speakerId?: string;
  text: string;
  language: string;
};

export type SceneTextOverlay = {
  id: string;
  text: string;
  startSec: number;
  endSec: number;
  xPct: number;
  yPct: number;
  fontSize: number;
  align: "left" | "center" | "right";
  enabled: boolean;
};

export type SceneEditorState = {
  trimInSec?: number;
  overlays?: SceneTextOverlay[];
  captionsEnabled?: boolean;
  muteVoice?: boolean;
  muteMusic?: boolean;
  muteSfx?: boolean;
  voiceLevel?: number;
  musicLevel?: number;
  sfxLevel?: number;
  mutationKey?: string;
};

export type SceneAudio = {
  voiceTrackId?: string;
  musicCue?: string;
  sfx?: string[];
  voiceRequired?: boolean;
  /** Additive editor metadata persisted on the scene audio jsonb. */
  editor?: SceneEditorState;
};

/** Frozen scene schema — Director, Router, Editor, Renderer, QC. */
export type Scene = {
  id: string;
  projectId: string;
  order: number;
  duration: number;
  prompt: string;
  camera: SceneCamera;
  visualStyle: string;
  references: SceneReference[];
  characters: string[];
  products: string[];
  dialogue: SceneDialogue;
  audio: SceneAudio;
  transition: string;
  providerPreference: SceneProviderPreference;
  fallbackProvider: ProductionVideoProvider | null;
  status: SceneStatus;
  qualityScore: number | null;
  artifactId?: string;
  purpose?: string;
  environment?: string;
  lighting?: string;
  voiceRequired?: boolean;
  planId?: string | null;
};

export type Character = {
  id: string;
  projectId: string;
  displayName: string;
  personaId?: string;
};

export type Product = {
  id: string;
  projectId: string;
  name: string;
  referenceUri?: string;
};

export type BrandReference = {
  id: string;
  projectId: string;
  businessName: string;
  brandIdentityId?: string | null;
  primary?: string;
  logoUrl?: string | null;
};

export const VIDEO_PLAN_STATUSES = ["active", "inactive", "archived"] as const;
export type VideoPlanStatus = (typeof VIDEO_PLAN_STATUSES)[number];

export type VideoPlan = {
  id: string;
  projectId: string;
  narrativeArc: string;
  pacing: string;
  preferredProvider: SceneProviderPreference;
  sceneIds: string[];
  createdAt: string;
  version?: number;
  status?: VideoPlanStatus;
  isActive?: boolean;
  sourcePrompt?: string | null;
  sourceHash?: string | null;
};

export type AudioPlan = {
  id: string;
  projectId: string;
  language: string;
  voiceScript: string;
  musicCue?: string;
  sfx: string[];
};

export type VideoProject = {
  id: string;
  userId: string;
  title: string;
  workflow: VideoWorkflow;
  state: VideoProjectState;
  planId: string | null;
  brandId: string | null;
  language: string;
  aspectRatio: string;
  createdAt: string;
  updatedAt: string;
};

export type ProviderJob = {
  id: string;
  projectId: string;
  sceneId: string;
  provider: ProductionVideoProvider;
  status: ProviderJobStatus;
  idempotencyKey: string;
  attempt: number;
  externalJobId?: string;
};

export type RenderJob = {
  id: string;
  projectId: string;
  status: "queued" | "processing" | "assembling" | "succeeded" | "failed" | "cancelled";
  mode: "full" | "avatar" | "image-to-video" | "batch-item";
  artifactId?: string;
};

export type VideoArtifact = {
  id: string;
  projectId: string;
  kind: "scene_clip" | "composite";
  mimeType: string;
  url: string;
  durationSec: number;
  width?: number;
  height?: number;
  provider: string;
  isStub?: boolean;
  bytes?: Uint8Array | null;
};

export type QualityReport = {
  id: string;
  projectId: string;
  subject: "project" | "scene" | "artifact";
  subjectId: string;
  ready: boolean;
  score: number;
  summary: string;
  blockers: string[];
};

export const PUBLISH_PLATFORMS = [
  "web",
  "tiktok",
  "instagram-reels",
  "youtube-shorts",
  "youtube",
  "linkedin",
] as const;

export type PublishPlatform = (typeof PUBLISH_PLATFORMS)[number];

export const PUBLISH_TARGET_STATUSES = [
  "draft",
  "publishing",
  "published",
  "unpublished",
  "failed",
] as const;

export type PublishTargetStatus = (typeof PUBLISH_TARGET_STATUSES)[number];

export type PublishTarget = {
  id: string;
  projectId: string;
  artifactId: string;
  platform: PublishPlatform;
  status: PublishTargetStatus;
  slug?: string;
  publicPath?: string;
};

export type QualityVerdict = "PASS" | "WARNING" | "BLOCKED";

export type TransitionContext = {
  artifact?: VideoArtifact | null;
  /** Phase 8: BLOCKED reports cannot leave quality_check for assembling. */
  qcVerdict?: QualityVerdict | null;
};
