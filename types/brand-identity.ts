import type { BrandVoiceTone, BrandColorEntry, BrandTypographySystem, BrandAsset } from "@/plugins/brand-identity/types";

export type BrandIdentityGenerationStatus = "pending" | "generating" | "completed" | "failed";
export type BrandIdentityGenerationMode = "generate" | "regenerate" | "continue" | "retry";

export type BrandIdentityBlueprint = {
  title: string;
  description: string;
  brandType: string;
  mission: string;
  vision: string;
  values: string[];
  voiceTone: BrandVoiceTone;
  colorPalette: BrandColorEntry[];
  typography: BrandTypographySystem;
  logoGuidelines: string;
  brandStory: string;
  brandStrategy: string;
  assets: BrandAsset[];
  files: { path: string; content: string; language: string }[];
  prompt: string;
  generatedAt: string;
  progressEvents?: string[];
};

export type BrandIdentityGeneration = {
  id: string;
  user_id: string;
  brand_name: string;
  brand_type: string;
  description: string;
  industry: string;
  target_audience: string;
  brand_personality: string;
  deliverables: string[];
  prompt: string;
  blueprint: BrandIdentityBlueprint | null;
  status: BrandIdentityGenerationStatus;
  mode: BrandIdentityGenerationMode;
  provider: string | null;
  token_usage: Record<string, number> | null;
  generation_time_ms: number | null;
  parent_generation_id: string | null;
  project_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};
