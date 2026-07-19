import type { CoreAssetRole } from "@/lib/ai-core/layers/types";
import type { ImageStylePreset } from "@/lib/ai-core/assets/settings";
import type { ImageArtDirection } from "@/lib/ai-core/image-engine/art-direction";
import type { AssetQualityReport } from "@/lib/ai-core/image-engine/validate";
import type { VideoAssetPackage } from "@/lib/ai-core/image-engine/video";

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
};

export type ImageEnginePlanItem = {
  id: string;
  kind: import("@/lib/ai-core/assets/types").AssetKind;
  role: CoreAssetRole;
  name: string;
  prompt: string;
  alt: string;
  realistic?: boolean;
  aspectRatio?: import("@/lib/ai-core/assets/settings").ImageAspectRatio;
  metadata: ImageAssetMetadata;
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
  /** Brand Identity image direction (when available). */
  brandImageDirection?: string;
  templateLabel?: string;
  premiumStyleId?: string;
  colors: { primary: string; secondary: string; accent?: string };
};

/** Extended manifest extras produced by Advanced AI Assets Engine. */
export type AdvancedAssetsExtras = {
  artDirectionByPurpose?: Record<string, ImageArtDirection>;
  qualityReport?: AssetQualityReport;
  videoPackage?: VideoAssetPackage;
};
