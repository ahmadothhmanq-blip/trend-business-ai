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
  structure: {
    overview: string;
    hierarchy: string[];
  };
  suggestedPages: Array<{
    name: string;
    purpose: string;
    keySections: string[];
  }>;
  uiComponents: Array<{
    name: string;
    description: string;
    placement: string;
  }>;
  colorPalette: Array<{
    name: string;
    hex: string;
    role: string;
  }>;
  typography: {
    headingFont: string;
    bodyFont: string;
    notes: string;
    scale: string[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    tips: string[];
  };
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
};

export type FavoriteItemType = "business_idea" | "market_analysis" | "report" | "website_generation";

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
  saved: number;
};

export type DashboardActivityItem = {
  id: string;
  type: "idea" | "analysis" | "report" | "website";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

export type DashboardHomeData = {
  stats: DashboardStats;
  recentActivity: DashboardActivityItem[];
};

export type HistoryItemType = "idea" | "analysis" | "report" | "website";

export type HistoryItem = {
  id: string;
  type: HistoryItemType;
  title: string;
  description: string;
  detail: string;
  href: string;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
