import type { ImagePurpose } from "@/lib/ai-core/image-engine/types";
import type { ImageStylePreset } from "@/lib/ai-core/assets/settings";
import type { ImageAspectRatio } from "@/lib/ai-core/assets/settings";
import type { SectionKey } from "@/lib/ai-core/image-engine/section-strategies";
import type { CoreAssetRole } from "@/lib/ai-core/layers/types";

export const IMAGE_INTELLIGENCE_TRACE_KEY = "imageIntelligenceTrace";
export const IMAGE_INTELLIGENCE_SPEC_KEY = "imageSystemSpec";
export const IMAGE_INTELLIGENCE_ENGINE_ID = "image-intelligence-engine";
export const IMAGE_INTELLIGENCE_ENGINE_VERSION = "1.0.0";

export type ImageIntelligencePhaseId =
  | "policy-resolve"
  | "purpose-classification"
  | "placement-reasoning"
  | "scene-planning"
  | "composition"
  | "style-reasoning"
  | "lighting"
  | "camera-perspective"
  | "color-harmony"
  | "accessibility"
  | "seo-metadata"
  | "validation"
  | "spec-lock";

export type ImageTraceEntry = {
  id: string;
  phase: ImageIntelligencePhaseId;
  ruleId: string;
  passed: boolean;
  severity: "info" | "warning" | "error";
  message: string;
  knowledgeEntryId?: string;
  timestamp: string;
};

export type ImageIntelligenceTrace = {
  version: "1";
  engineId: typeof IMAGE_INTELLIGENCE_ENGINE_ID;
  engineVersion: typeof IMAGE_INTELLIGENCE_ENGINE_VERSION;
  createdAt: string;
  industryId: string;
  phases: ImageIntelligencePhaseId[];
  entries: ImageTraceEntry[];
  summary: string;
};

export type ImagePolicy = {
  industryId: string;
  knowledgeEntryId: string;
  requiredPurposes: ImagePurpose[];
  minImageCount: number;
  maxImageCount: number;
  defaultImageStyle: ImageStylePreset;
  photographyStyle: string[];
  forbiddenSubjects: string[];
  heroShotSeed: string;
  storytellingNotes: string[];
  compositionGuidelines: string[];
  lightingStrategy: string;
  cameraStrategy: string;
  colorHarmonyNotes: string[];
  accessibilityPolicies: string[];
  seoKeywordMinLength: number;
  lockedKeywords: string[];
};

/** Provider-agnostic structured image specification — SSOT for generation. */
export type ImageSpecification = {
  id: string;
  purpose: ImagePurpose;
  role: CoreAssetRole;
  sectionKey?: SectionKey;
  sectionLabel?: string;
  placement: string;
  subject: string;
  scene: string;
  composition: string;
  lighting: string;
  cameraPerspective: string;
  style: ImageStylePreset;
  colorHarmony: string;
  storytellingRole: string;
  aspectRatio: ImageAspectRatio;
  required: boolean;
  accessibility: {
    altText: string;
    caption?: string;
    decorative: boolean;
    ariaLabel?: string;
  };
  seo: {
    title?: string;
    description: string;
    keywords: string[];
  };
  /** Locked provider-agnostic prompt — downstream generators translate only. */
  providerPrompt: string;
  artDirectionSummary?: string;
  /** Section narrative purpose — drives semantic image selection. */
  sectionPurpose?: string;
  /** Parent page goal for contextual alignment. */
  pagePurpose?: string;
  /** Resolved visual concept — SSOT for semantic relevance. */
  visualConcept?: string;
};

export type ImageSystemSpec = {
  version: "1";
  industryId: string;
  imageStyle: ImageStylePreset;
  specifications: ImageSpecification[];
  policy: Pick<
    ImagePolicy,
    | "forbiddenSubjects"
    | "photographyStyle"
    | "lightingStrategy"
    | "cameraStrategy"
  >;
  colorHarmony: {
    primary: string;
    secondary: string;
    accent?: string;
    notes: string;
  };
  coverage: {
    requiredPurposes: ImagePurpose[];
    plannedPurposes: ImagePurpose[];
    missingPurposes: ImagePurpose[];
  };
};

export type ImageIntelligenceValidation = {
  valid: boolean;
  warnings: string[];
  errors: string[];
  trace: ImageTraceEntry[];
  corrections: string[];
};

export type ImageIntelligenceEngineResult = {
  spec: ImageSystemSpec;
  validation: ImageIntelligenceValidation;
  trace: ImageIntelligenceTrace;
  policy: ImagePolicy;
};
