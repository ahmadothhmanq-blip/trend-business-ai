export type Profile = {
  id: string;
  full_name: string | null;
  company: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type BusinessIdea = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  industry: string;
  target_market: string;
  revenue_model: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type MarketAnalysis = {
  id: string;
  user_id: string;
  industry: string;
  region: string;
  target_audience: string;
  market_size: string;
  growth_rate: string;
  competitors: string[];
  opportunities: string[];
  risks: string[];
  summary: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type AIReport = {
  id: string;
  user_id: string;
  title: string;
  report_type: string;
  topic: string;
  timeframe: string;
  content: string;
  insights: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type WebsiteBlueprint = {
  structure?: {
    overview: string;
    hierarchy: string[];
  };
  suggestedPages?: Array<{
    name: string;
    purpose: string;
    keySections: string[];
  }>;
  uiComponents?: Array<{
    name: string;
    description: string;
    placement: string;
  }>;
  colorPalette?: Array<{
    name: string;
    hex: string;
    role: string;
  }> | string[];
  typography?: {
    headingFont: string;
    bodyFont: string;
    notes: string;
    scale: string[];
  } | string[];
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    tips: string[];
  } | string[];
  /** Design Engine layer artifacts (persisted on GeneratedWebsiteProject shape). */
  businessProfile?: Record<string, unknown>;
  strategy?: Record<string, unknown>;
  designSystem?: Record<string, unknown>;
  assetManifest?: Record<string, unknown>;
  qualityReport?: Record<string, unknown>;
  files?: Array<{ path: string; content: string; language?: string }>;
  title?: string;
  description?: string;
  pages?: string[];
  sections?: string[];
  components?: string[];
  content?: string[];
  roadmap?: string[];
};

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type GenerationStatus = "pending" | "running" | "completed" | "failed";
export type GenerationMode = "generate" | "regenerate" | "continue" | "retry";

export type PromptVersion = {
  id: string;
  prompt: string;
  createdAt: string;
  mode?: GenerationMode;
};

export type GenerationAttachmentMeta = {
  id: string;
  fileName: string;
  fileType: "file" | "image";
  mimeType?: string;
  sizeBytes?: number;
  storagePath: string;
  publicUrl?: string | null;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  product_id: string | null;
  workspace_type: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type WebsiteGeneration = {
  id: string;
  user_id: string;
  project_name: string;
  website_type: string;
  business_description: string;
  target_audience: string;
  language: string;
  color_style: string;
  design_style: string;
  page_count: string;
  features: string[];
  blueprint: WebsiteBlueprint;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  project_id?: string | null;
  product_id?: string | null;
  status?: GenerationStatus;
  mode?: GenerationMode;
  parent_generation_id?: string | null;
  provider?: string | null;
  token_usage?: TokenUsage;
  generation_time_ms?: number | null;
  error_message?: string | null;
  prompt_versions?: PromptVersion[];
  attachments?: GenerationAttachmentMeta[];
};

export type FavoriteItemType =
  | "business_idea"
  | "market_analysis"
  | "report"
  | "website_generation"
  | "webapp_generation"
  | "landing_page_generation"
  | "logo_generation"
  | "brand_identity_generation"
  | "image_generation"
  | "video_generation"
  | "content_generation"
  | "business_generation"
  | "agent_execution"
  | "workspace_generation";

export type WorkspaceType =
  | "brand"
  | "creative"
  | "content"
  | "business"
  | "manager"
  | "marketing"
  | "social"
  | "audit";

export type WorkspaceSection = {
  heading: string;
  content: string;
};

export type WorkspaceOutput = {
  title: string;
  summary: string;
  sections: WorkspaceSection[];
  deliverables: string[];
  progressEvents?: string[];
  generatedAt?: string;
  source?: "deepseek" | "openai" | "claude" | "gemini" | "grok" | "llama" | "structured" | string;
  productId?: string;
  depth?: "focused" | "standard" | "deep";
  tokenUsage?: TokenUsage;
  generationTimeMs?: number;
  mode?: GenerationMode;
  continuedFrom?: string;
};

export type WorkspaceGeneration = {
  id: string;
  user_id: string;
  workspace_type: WorkspaceType;
  title: string;
  brief: string;
  template: string | null;
  language: string;
  theme: string;
  features: string[];
  output: WorkspaceOutput;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  project_id?: string | null;
  product_id?: string | null;
  status?: GenerationStatus;
  mode?: GenerationMode;
  parent_generation_id?: string | null;
  provider?: string | null;
  token_usage?: TokenUsage;
  generation_time_ms?: number | null;
  error_message?: string | null;
  prompt_versions?: PromptVersion[];
  attachments?: GenerationAttachmentMeta[];
  draft_prompt?: string | null;
};

export type Favorite = {
  id: string;
  user_id: string;
  item_type: FavoriteItemType;
  item_id: string;
  created_at: string;
};

export type UserPreferences = {
  user_id: string;
  theme: "light" | "dark" | "system";
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  ideas: number;
  analyses: number;
  reports: number;
  websites: number;
  workspaces: number;
  saved: number;
};

export type DashboardActivityItem = {
  id: string;
  type: "idea" | "analysis" | "report" | "website" | "workspace";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

export type DashboardHomeData = {
  stats: DashboardStats;
  recentActivity: DashboardActivityItem[];
};

export type HistoryItemType =
  | "idea"
  | "analysis"
  | "report"
  | "website"
  | "workspace";

export type HistoryItem = {
  id: string;
  type: HistoryItemType;
  title: string;
  description: string;
  detail: string;
  href: string;
  createdAt: string;
  workspaceType?: WorkspaceType;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** AI Core Engine run ledger (migration 033). Used by /api/ai-core/runs (Phase 5). */
export type AiRunStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type AiRun = {
  id: string;
  user_id: string;
  product_id: string;
  status: AiRunStatus;
  mode: GenerationMode;
  parent_run_id: string | null;
  brief: Record<string, unknown>;
  artifacts: Record<string, unknown>;
  layers_executed: string[];
  provider: string | null;
  token_usage: TokenUsage | null;
  generation_time_ms: number | null;
  error_message: string | null;
  continue_instruction: string | null;
  created_at: string;
  updated_at: string;
};
