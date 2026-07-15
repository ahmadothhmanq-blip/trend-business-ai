import type { GeneratedProjectFile } from "@/lib/ai/types";

export type LandingPageGenerationStatus = "pending" | "generating" | "completed" | "failed";
export type LandingPageGenerationMode = "generate" | "regenerate" | "continue" | "retry";

export type LandingPageBlueprint = {
  title: string;
  description: string;
  pageType: string;
  framework: string;
  sections: { name: string; description: string }[];
  files: GeneratedProjectFile[];
  settings: Record<string, string>;
  prompt: string;
  generatedAt: string;
  progressEvents?: string[];
};

export type LandingPageGeneration = {
  id: string;
  user_id: string;
  page_name: string;
  page_type: string;
  description: string;
  language: string;
  design_style: string;
  color_style: string;
  sections: string[];
  prompt: string;
  blueprint: LandingPageBlueprint | null;
  status: LandingPageGenerationStatus;
  mode: LandingPageGenerationMode;
  provider: string | null;
  token_usage: Record<string, number> | null;
  generation_time_ms: number | null;
  parent_generation_id: string | null;
  project_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};
