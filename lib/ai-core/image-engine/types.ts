import type { CoreAssetRole } from "@/lib/ai-core/layers/types";
import type { ImageStylePreset } from "@/lib/ai-core/assets/settings";
import type { ImageArtDirection } from "@/lib/ai-core/image-engine/art-direction";
import type { AssetQualityReport } from "@/lib/ai-core/image-engine/validate";
import type { VideoAssetPackage } from "@/lib/ai-core/image-engine/video";
import type { SectionKey } from "@/lib/ai-core/image-engine/section-strategies";
import type { DesignPlanImageRequirement } from "@/lib/ai-core/design-plan/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";

/** Why the image exists on the generated website. */
export type ImagePurpose =
  | "hero"
  | "section"
  | "product"
  | "service"
  | "background"
  | "gallery"
  | "brand"
  | "testimonial";

/** Metadata attached to every planned/generated image. */
export type ImageAssetMetadata = {
  purpose: ImagePurpose;
  section?: string;
  style: ImageStylePreset;
  prompt: string;
  provider?: string;
  artDirection?: string;
  visualConcept?: string;
  sectionPurpose?: string;
  pagePurpose?: string;
};

export type ImageEnginePlanItem = {
  id: string;
  kind: import("@/lib/ai-core/assets/types").AssetKind;
  role: CoreAssetRole;
  name: string;
  prompt: string;
  alt: string;
  caption?: string;
  seoDescription?: string;
  realistic?: boolean;
  aspectRatio?: import("@/lib/ai-core/assets/settings").ImageAspectRatio;
  sectionKey?: SectionKey;
  metadata: ImageAssetMetadata;
};

export type StructuredImageRequirement = {
  role: ImagePurpose | "testimonial";
  sectionKey?: SectionKey;
  sectionLabel?: string;
  brief: string;
  style?: string;
  notes?: string;
  required?: boolean;
};

export type ImageIntelligenceContext = {
  businessType: string;
  industry: string;
  brandStyle: string;
  designStyle: string;
  designPreset: string;
  targetAudience: string;
  offer: string;
  projectName: string;
  imageStyle: ImageStylePreset;
  imageRequirements: string[];
  /** Role-matched briefs from premium templates / design plan. */
  structuredRequirements?: StructuredImageRequirement[];
  /** Brand Identity image direction (when available). */
  brandImageDirection?: string;
  templateLabel?: string;
  premiumStyleId?: string;
  colors: { primary: string; secondary: string; accent?: string };
  /** AI Business Intelligence profile — gates semantic asset selection. */
  businessProfile?: BusinessIntelligenceProfile | null;
};

export type DesignPlanImageContext = {
  sections?: Array<{
    key: string;
    label: string;
    purpose?: string;
    assetRole?: DesignPlanImageRequirement["role"];
  }>;
  heroTreatment?: string;
  layoutStyle?: string;
};

/** Extended manifest extras produced by Advanced AI Assets Engine. */
export type AdvancedAssetsExtras = {
  artDirectionByPurpose?: Record<string, ImageArtDirection>;
  qualityReport?: AssetQualityReport;
  videoPackage?: VideoAssetPackage;
};
