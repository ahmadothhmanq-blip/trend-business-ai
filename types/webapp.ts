import type { GeneratedProjectFile } from "@/lib/ai/types";

export type WebAppGenerationStatus = "pending" | "generating" | "completed" | "failed";
export type WebAppGenerationMode = "generate" | "regenerate" | "continue" | "retry";

export type WebAppBlueprint = {
  title: string;
  description: string;
  appType: string;
  framework: string;
  pages: { name: string; path: string; description: string }[];
  files: GeneratedProjectFile[];
  settings: Record<string, string>;
  prompt: string;
  generatedAt: string;
  progressEvents?: string[];
};

export type WebAppGeneration = {
  id: string;
  user_id: string;
  app_name: string;
  app_type: string;
  description: string;
  language: string;
  design_style: string;
  color_style: string;
  features: string[];
  prompt: string;
  blueprint: WebAppBlueprint | null;
  status: WebAppGenerationStatus;
  mode: WebAppGenerationMode;
  provider: string | null;
  token_usage: Record<string, number> | null;
  generation_time_ms: number | null;
  parent_generation_id: string | null;
  project_id: string | null;
  product_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type WebAppGenerationInput = {
  prompt: string;
  appType: string;
  language: string;
  designStyle: string;
  colorStyle: string;
  features: string[];
  mode?: WebAppGenerationMode;
  parentGenerationId?: string;
  projectId?: string;
};
