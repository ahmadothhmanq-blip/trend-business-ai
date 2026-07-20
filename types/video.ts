import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import type { VideoVersionHistory } from "@/lib/ai-core/video-production-platform/versions";

export type VideoGenerationStatus = "pending" | "generating" | "completed" | "failed";
export type VideoGenerationMode = "generate" | "regenerate" | "continue" | "retry";

export type VideoScene = {
  id: string;
  name: string;
  description: string;
  duration: string;
  visualPrompt: string;
  cameraMove: string;
  mood: string;
  narration: string;
  musicDirection: string;
  sfxNotes: string;
  transition: string;
  svgStoryboard: string;
};

export type VideoBlueprint = {
  title: string;
  description: string;
  videoType: string;
  style: string;
  aspectRatio: string;
  totalDuration: string;
  scenes: VideoScene[];
  script: string;
  voiceoverScript: string;
  musicSuggestions: { name: string; genre: string; mood: string; bpm: string }[];
  subtitles: { timestamp: string; text: string }[];
  thumbnailSvg: string;
  colorGrade: string;
  exportPreset: string;
  files: { path: string; content: string; language: string }[];
  prompt: string;
  generatedAt: string;
  progressEvents?: string[];
  productionModel?: VideoProductionModel;
  versionHistory?: VideoVersionHistory;
};

export type VideoGeneration = {
  id: string;
  user_id: string;
  video_name: string;
  video_type: string;
  description: string;
  style: string;
  aspect_ratio: string;
  duration: string;
  options: string[];
  prompt: string;
  blueprint: VideoBlueprint | null;
  status: VideoGenerationStatus;
  mode: VideoGenerationMode;
  provider: string | null;
  token_usage: Record<string, number> | null;
  generation_time_ms: number | null;
  parent_generation_id: string | null;
  project_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};
