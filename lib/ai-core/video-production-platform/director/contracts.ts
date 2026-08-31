/**
 * AI Video Director contracts (Phase 5).
 * Richer planning document mapped onto frozen Scene / VideoPlan persistence.
 * Missing input fields stay missing — callers must not invent brand/audience/CTA.
 */

import type {
  BrandReference,
  Character,
  Product,
  ProductionVideoProvider,
  Scene,
  SceneProviderPreference,
  VideoWorkflow,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import type { RouterQuality } from "@/lib/ai-core/video-production-platform/provider-router/contract";

export const DIRECTOR_ASPECT_RATIOS = ["16:9", "9:16", "1:1"] as const;
export type DirectorAspectRatio = (typeof DIRECTOR_ASPECT_RATIOS)[number];

export const DIRECTOR_QUALITY_TIERS = ["draft", "standard", "high"] as const;
export type DirectorQualityTier = (typeof DIRECTOR_QUALITY_TIERS)[number];

export const DIRECTOR_PACING = ["slow", "measured", "dynamic", "fast"] as const;
export type DirectorPacing = (typeof DIRECTOR_PACING)[number];

export const MAX_DIRECTOR_SCENES = 12;
export const MIN_DIRECTOR_SCENES = 1;
export const MIN_SCENE_DURATION_SEC = 1;
export const MAX_PLAN_DURATION_SEC = 180;
export const MIN_PLAN_DURATION_SEC = 3;
export const DURATION_TOLERANCE_SEC = 0.5;
export const DIRECTOR_SPEC_VERSION = 1;

export type DirectorCharacter = Character & {
  face?: string;
  style?: string;
  wardrobe?: string;
  voice?: string;
  language?: string;
};

export type DirectorProduct = Product & {
  visualReference?: string;
  identity?: string;
};

export type DirectorBrand = BrandReference & {
  colors?: string[];
  fonts?: string[];
  tone?: string;
  visualRules?: string[];
};

export type DirectorInput = {
  prompt: string;
  workflow?: VideoWorkflow;
  objective?: string;
  audience?: string;
  duration?: number;
  aspectRatio?: string;
  language?: string;
  country?: string;
  style?: string;
  quality?: DirectorQualityTier | RouterQuality;
  budget?: number;
  brandId?: string;
  productIds?: string[];
  characterIds?: string[];
  voicePreference?: string;
  platform?: string;
  callToAction?: string;
  characters?: DirectorCharacter[];
  products?: DirectorProduct[];
  brand?: DirectorBrand;
};

export type DirectorProviderHint = {
  sceneOrder: number;
  preferredProvider: SceneProviderPreference;
  fallbackProvider: ProductionVideoProvider | null;
  reason: string;
};

export type DirectorAudioPlan = {
  id: string;
  projectId: string;
  narrationRequired: boolean;
  speaker?: string;
  language: string;
  tone?: string;
  musicRequired: boolean;
  musicMood?: string;
  sfxRequired: boolean;
  dialoguePerScene: Array<{ sceneOrder: number; text: string; speakerId?: string }>;
  voiceScript: string;
  musicCue?: string;
  sfx: string[];
};

export type DirectorOutputVariant = {
  aspectRatio: DirectorAspectRatio;
  supported: true;
};

export type DirectorScene = Scene & {
  purpose: string;
  environment: string;
  lighting: string;
  voiceRequired: boolean;
};

export type DirectorVideoPlan = {
  id: string;
  projectId: string;
  title?: string;
  workflow: VideoWorkflow;
  objective: string;
  audience?: string;
  narrative: string;
  totalDuration: number;
  aspectRatio: DirectorAspectRatio;
  language: string;
  visualStyle: string;
  pacing: DirectorPacing;
  qualityTier?: DirectorQualityTier;
  budget?: number;
  scenes: DirectorScene[];
  characters: DirectorCharacter[];
  products: DirectorProduct[];
  brandReferences: DirectorBrand[];
  audioPlan: DirectorAudioPlan;
  outputVariants: DirectorOutputVariant[];
  providerHints: DirectorProviderHint[];
  callToAction?: string;
  createdAt: string;
};

export type DirectorStatus = "ready" | "failed" | "reused";

export type DirectorResult = {
  status: DirectorStatus;
  plan: DirectorVideoPlan | null;
  reused: boolean;
  errorCode?: string;
  errorMessage?: string;
};
