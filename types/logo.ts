export type LogoGenerationStatus = "pending" | "generating" | "completed" | "failed";
export type LogoGenerationMode = "generate" | "regenerate" | "continue" | "retry";

export type LogoBlueprint = {
  title: string;
  description: string;
  logoStyle: string;
  concepts: { name: string; description: string; svgCode: string }[];
  colorPalette: { name: string; hex: string; role: string }[];
  typography: { primary: string; secondary: string; notes: string };
  variations: { name: string; description: string; useCase: string; svgCode: string }[];
  guidelines: string;
  files: { path: string; content: string; language: string }[];
  prompt: string;
  generatedAt: string;
  progressEvents?: string[];
};

export type LogoGeneration = {
  id: string;
  user_id: string;
  logo_name: string;
  logo_style: string;
  description: string;
  industry: string;
  color_palette: string;
  icon_style: string;
  options: string[];
  prompt: string;
  blueprint: LogoBlueprint | null;
  status: LogoGenerationStatus;
  mode: LogoGenerationMode;
  provider: string | null;
  token_usage: Record<string, number> | null;
  generation_time_ms: number | null;
  parent_generation_id: string | null;
  project_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};
