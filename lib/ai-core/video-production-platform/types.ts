/**
 * Video Production Platform — structured types for Trend Business AI Video Studio.
 * Video Studio only.
 */

export type VideoJobStatus =
  | "queued"
  | "processing"
  | "rendering"
  | "completed"
  | "failed"
  | "cancelled";

export type VideoClipStatus = VideoJobStatus;

export type VideoMediaAsset = {
  id: string;
  kind: "clip" | "audio" | "subtitle" | "thumbnail" | "poster" | "composite";
  mimeType: string;
  /** Signed URL, public URL, data URL, or storage:// path */
  url: string;
  posterUrl?: string;
  storagePath?: string;
  durationSec: number;
  width?: number;
  height?: number;
  /** preview | external | stub | kling | runway | heygen | elevenlabs | openai | … */
  provider: string;
  createdAt: string;
};

export type VideoRenderClip = {
  id: string;
  sceneId: string;
  status: VideoClipStatus;
  progress: number;
  visualPrompt: string;
  asset?: VideoMediaAsset;
  externalJobId?: string;
  error?: string;
  updatedAt: string;
};

export type VideoRenderJob = {
  id: string;
  status: VideoJobStatus;
  progress: number;
  mode: "preview" | "full" | "batch-item" | "image-to-video" | "avatar";
  clips: VideoRenderClip[];
  compositeAsset?: VideoMediaAsset;
  audioAsset?: VideoMediaAsset;
  provider: string;
  message: string;
  costCreditsEstimate?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type SocialExportPresetId =
  | "tiktok"
  | "instagram-reels"
  | "youtube-shorts"
  | "youtube"
  | "linkedin";

export type SocialExportPreset = {
  id: SocialExportPresetId;
  label: string;
  aspectRatio: string;
  maxDurationSec: number;
  quality: "1080p" | "720p" | "4k";
  captions: boolean;
};

export type PresenterPersonaId =
  | "fitness-trainer"
  | "doctor"
  | "teacher"
  | "business-expert"
  | "news-presenter"
  | "sales-representative"
  | "fashion-model"
  | "chef"
  | "automotive-expert"
  | "real-estate-agent"
  | "custom";

export type LocationId =
  | "gym"
  | "clinic"
  | "office"
  | "restaurant"
  | "store"
  | "studio"
  | "factory"
  | "showroom"
  | "home"
  | "street"
  | "custom";

export type ContentTypeId =
  | "marketing"
  | "educational"
  | "motivational"
  | "company-presentation"
  | "training"
  | "social-media"
  | "product-ad"
  | "product-launch"
  | "product-review"
  | "ecommerce"
  | "sales";

export type AiPresenterProfile = {
  id: string;
  personaId: PresenterPersonaId;
  displayName: string;
  appearance: string;
  facialExpressionStyle: string;
  bodyMotionStyle: string;
  lipSyncProfile: string;
  voiceId: string;
  voiceStyle: string;
  languages: string[];
  accents: string[];
  realismLevel: "preview" | "high" | "ultra";
};

export type VideoVoiceTrack = {
  id: string;
  voiceId: string;
  style: string;
  language: string;
  accent?: string;
  script: string;
  status: VideoJobStatus;
  asset?: VideoMediaAsset;
};

export type VideoAudioBed = {
  id: string;
  kind: "music" | "sfx";
  name: string;
  genre?: string;
  mood?: string;
  bpm?: string;
  status: VideoJobStatus;
  asset?: VideoMediaAsset;
};

export type VideoChapter = {
  id: string;
  title: string;
  startSec: number;
  endSec: number;
  sceneIds: string[];
};

export type VideoEditorScene = {
  id: string;
  name: string;
  order: number;
  durationSec: number;
  script: string;
  visualPrompt: string;
  cameraMove: string;
  presenterId?: string;
  voiceId?: string;
  transition: string;
  svgStoryboard?: string;
  clipId?: string;
};

export type VideoBrandOverlay = {
  businessName: string;
  logoUrl?: string | null;
  primary?: string;
  secondary?: string;
  accent?: string;
  headingFont?: string;
  bodyFont?: string;
  brandIdentityId?: string | null;
};

export type VideoProductionModel = {
  version: number;
  title: string;
  videoType: string;
  templateId?: string;
  aspectRatio: string;
  targetDurationSec: number;
  durationTier: "short" | "social" | "marketing" | "long";
  language: string;
  platform?: string;
  style: string;
  mood: string;
  presenter?: AiPresenterProfile;
  locationId?: LocationId;
  contentTypeId?: ContentTypeId;
  brand?: VideoBrandOverlay;
  scenes: VideoEditorScene[];
  chapters: VideoChapter[];
  voiceTracks: VideoVoiceTrack[];
  audioBeds: VideoAudioBed[];
  subtitles: { timestamp: string; text: string; startSec?: number; endSec?: number }[];
  jobs: VideoRenderJob[];
  assets: VideoMediaAsset[];
  productImageUrl?: string | null;
  educationalSource?: { kind: "text" | "pdf" | "document"; summary: string };
  batchMeta?: { batchId: string; index: number; total: number };
  createdAt: string;
  updatedAt: string;
};

export type VideoTemplateDefinition = {
  id: string;
  label: string;
  category: "product-marketing" | "professional-presenter" | "location" | "content-type" | "combo";
  contentType: ContentTypeId;
  presenterPersona: PresenterPersonaId;
  location: LocationId;
  character: string;
  environment: string;
  cameraStyle: string;
  motionStyle: string;
  voiceStyle: string;
  scriptStructure: string[];
  recommendedDurationSec: number;
  visualStyle: string;
  tags: string[];
  expandable: true;
};

export type VideoQualityCheck = {
  id: string;
  label: string;
  passed: boolean;
  severity: "blocker" | "warning" | "info";
  detail: string;
};

export type VideoQualityReport = {
  ready: boolean;
  score: number;
  checks: VideoQualityCheck[];
  summary: string;
};

export type VideoVersionSnapshot = {
  id: string;
  label: string;
  createdAt: string;
  note?: string;
  model: VideoProductionModel;
};

export type VideoBatchRequest = {
  prompt: string;
  count: number;
  durationSec: number;
  language: string;
  style: string;
  platform: string;
  videoType?: string;
};

export type VideoBatchPlanItem = {
  index: number;
  title: string;
  idea: string;
  scriptOutline: string;
  templateId: string;
  sceneCount: number;
};
