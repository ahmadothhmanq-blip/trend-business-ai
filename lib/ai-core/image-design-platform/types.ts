/**
 * Canonical Image Design Model — AI Design Studio output.
 */

import type { ImageVariation } from "@/plugins/image-generator/types";
import type { ImageProviderId, ImageQuality, ImageStylePreset } from "@/lib/ai-core/assets/settings";

export type ImageAssetFormat = "png" | "jpg" | "webp" | "svg";

export type ImageGenerationStatus =
  | "pending"
  | "generating"
  | "completed"
  | "failed"
  | "fallback";

export type ImageRasterAsset = {
  id: string;
  name: string;
  format: ImageAssetFormat;
  mimeType: string;
  width?: number;
  height?: number;
  provider: string;
  model?: string;
  storagePath?: string | null;
  publicUrl?: string | null;
  dataUrl?: string | null;
  seed?: number | null;
  status: ImageGenerationStatus;
  prompt: string;
  negativePrompt?: string;
};

export type BrandKitContext = {
  brandName?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  headingFont?: string;
  bodyFont?: string;
  voiceTone?: string;
  tagline?: string;
  logoSvg?: string;
  instructions?: string;
};

export type ImageDesignModel = {
  brandName?: string;
  title: string;
  description: string;
  imageType: string;
  style: string;
  aspectRatio: string;
  mood: string;
  quality: ImageQuality;
  stylePreset: ImageStylePreset;
  preferredProvider?: ImageProviderId;
  negativePrompt: string;
  concepts: ImageVariation[];
  rasterAssets: ImageRasterAsset[];
  colorDirection: string;
  moodBoard: string[];
  promptLibrary: { name: string; prompt: string; negativePrompt: string; style: string }[];
  files: { path: string; content: string; language: string }[];
  brand?: BrandKitContext;
  templateId?: string;
  qualityScore: number;
  qualityIssues: string[];
  providerUsed?: string;
  generatedAt: string;
};

export type DesignTemplateDefinition = {
  id: string;
  label: string;
  category: "social-media" | "advertising" | "product" | "business" | "presentation";
  industry?: string;
  description: string;
  imageType: string;
  style: string;
  aspectRatio: string;
  mood: string;
  deliverables: string[];
  previewColors: string[];
  recommended?: boolean;
};

export type DesignProjectRecord = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type DesignAssetRecord = {
  id: string;
  project_id: string | null;
  generation_id: string;
  user_id: string;
  name: string;
  format: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  storage_path: string | null;
  public_url: string | null;
  provider: string | null;
  metadata: Record<string, unknown>;
  version: number;
  created_at: string;
};

export type DesignGenerationRecord = {
  id: string;
  image_generation_id: string;
  user_id: string;
  project_id: string | null;
  model: ImageDesignModel;
  status: ImageGenerationStatus;
  provider: string | null;
  version: number;
  created_at: string;
};
