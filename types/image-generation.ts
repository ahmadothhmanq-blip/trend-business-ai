import type { ImageVariation } from "@/plugins/image-generator/types";

export type ImageGenerationStatus = "pending" | "generating" | "completed" | "failed";
export type ImageGenerationMode = "generate" | "regenerate" | "continue" | "retry";

export type ImageBlueprint = {
  title: string;
  description: string;
  imageType: string;
  style: string;
  concepts: ImageVariation[];
  colorDirection: string;
  moodBoard: string[];
  promptLibrary: { name: string; prompt: string; negativePrompt: string; style: string }[];
  files: { path: string; content: string; language: string }[];
  prompt: string;
  negativePrompt: string;
  generatedAt: string;
  progressEvents?: string[];
};

export type ImageGeneration = {
  id: string;
  user_id: string;
  image_name: string;
  image_type: string;
  description: string;
  style: string;
  aspect_ratio: string;
  mood: string;
  options: string[];
  prompt: string;
  blueprint: ImageBlueprint | null;
  status: ImageGenerationStatus;
  mode: ImageGenerationMode;
  provider: string | null;
  token_usage: Record<string, number> | null;
  generation_time_ms: number | null;
  parent_generation_id: string | null;
  project_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};
