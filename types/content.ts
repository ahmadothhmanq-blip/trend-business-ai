export type ContentGenerationStatus = "pending" | "generating" | "completed" | "failed";
export type ContentGenerationMode = "generate" | "regenerate" | "continue" | "rewrite" | "expand" | "shorten" | "translate" | "summarize";

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

/* ------------------------------------------------------------------ */
/*  Content Studio Platform                                            */
/* ------------------------------------------------------------------ */

export type ContentDocumentStatus = "draft" | "published" | "archived";

export type ContentVersionSource =
  | "manual"
  | "autosave"
  | "ai_action"
  | "generation"
  | "restore";

export type ContentActionType =
  | "rewrite"
  | "improve"
  | "expand"
  | "shorten"
  | "summarize"
  | "translate"
  | "change_tone"
  | "change_style";

export type ContentTemplateCategory =
  | "Blog"
  | "Social Media"
  | "Ads"
  | "Email"
  | "Product Description"
  | "Landing Pages"
  | "SEO Articles"
  | "Business Documents";

export type ContentTemplateVariable = {
  key: string;
  label: string;
  placeholder?: string;
  default?: string;
};

export type ContentProject = {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  description: string;
  color: string;
  is_folder: boolean;
  is_favorite: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContentDocument = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  body: string;
  content_type: string;
  content_tool: string;
  status: ContentDocumentStatus;
  is_favorite: boolean;
  word_count: number;
  char_count: number;
  metadata: Record<string, unknown>;
  generation_id: string | null;
  brand_identity_id: string | null;
  last_edited_at: string;
  created_at: string;
  updated_at: string;
};

export type ContentVersion = {
  id: string;
  user_id: string;
  document_id: string;
  version_number: number;
  title: string;
  body: string;
  change_summary: string;
  source: ContentVersionSource;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ContentTemplate = {
  id: string;
  user_id: string | null;
  name: string;
  category: string;
  description: string;
  prompt_structure: string;
  variables: ContentTemplateVariable[];
  preview: string;
  content_tool: string;
  content_type: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
};

export type BrandVoiceContext = {
  brandName: string;
  tone: string;
  tagline: string;
  elevatorPitch: string;
  doExamples: string[];
  dontExamples: string[];
  vocabulary: string[];
  writingStyle: string;
};
