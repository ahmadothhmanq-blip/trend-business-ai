export type ContentGenerationStatus = "pending" | "generating" | "completed" | "failed";
export type ContentGenerationMode = "generate" | "regenerate" | "rewrite" | "expand" | "shorten" | "translate" | "summarize";

export type ContentSeoData = {
  score: number;
  keywordDensity: Record<string, number>;
  metaTitle: string;
  metaDescription: string;
  headingStructure: string[];
  internalLinkingSuggestions: string[];
  faqItems: { question: string; answer: string }[];
  schemaSuggestions: string[];
  readabilityScore: number;
  wordCount: number;
};

export type ContentBlueprint = {
  title: string;
  contentTool: string;
  contentType: string;
  body: string;
  headlines: string[];
  seo: ContentSeoData | null;
  suggestions: string[];
  improvements: string[];
  summary: string;
  files: { path: string; content: string; language: string }[];
  prompt: string;
  tone: string;
  audience: string;
  language: string;
  writingStyle: string;
  creativityLevel: string;
  generatedAt: string;
  progressEvents?: string[];
};

export type ContentGeneration = {
  id: string;
  user_id: string;
  title: string;
  content_tool: string;
  content_type: string;
  description: string;
  prompt: string;
  tone: string;
  audience: string;
  language: string;
  brand_voice: string;
  writing_style: string;
  creativity_level: string;
  options: string[];
  seo_keywords: string;
  blueprint: ContentBlueprint | null;
  status: ContentGenerationStatus;
  mode: ContentGenerationMode;
  provider: string | null;
  token_usage: Record<string, number> | null;
  generation_time_ms: number | null;
  parent_generation_id: string | null;
  project_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type CalendarEntryStatus = "draft" | "scheduled" | "published" | "archived";

export type CalendarEntry = {
  id: string;
  user_id: string;
  title: string;
  content_type: string;
  description: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: CalendarEntryStatus;
  category: string;
  tags: string[];
  platform: string;
  generation_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};
