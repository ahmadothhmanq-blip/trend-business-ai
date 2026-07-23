export type MarketingCampaignStatus =
  | "draft"
  | "planned"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type MarketingPlanStatus = "draft" | "active" | "completed" | "archived";

export type MarketingWorkflowStatus = "draft" | "active" | "paused" | "completed";

export type MarketingChannelType =
  | "email"
  | "social"
  | "ads"
  | "content"
  | "seo";

export type MarketingChannel = {
  type: MarketingChannelType;
  label: string;
  enabled: boolean;
  budget?: number;
  notes?: string;
};

export type MarketingCampaign = {
  id: string;
  user_id: string;
  name: string;
  objective: string;
  status: MarketingCampaignStatus;
  budget: number | null;
  channels: MarketingChannel[];
  start_date: string | null;
  end_date: string | null;
  strategy: Record<string, unknown>;
  timeline: Array<{ label: string; date: string; status?: string }>;
  kpis: Array<{ name: string; target: string; current?: string }>;
  is_favorite: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingPlan = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  name: string;
  status: MarketingPlanStatus;
  summary: string;
  goals: string[];
  audience: string;
  offer: string;
  messaging: string;
  channels: MarketingChannel[];
  timeline: Array<{ phase: string; start: string; end: string; tasks: string[] }>;
  kpis: Array<{ name: string; target: string }>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CustomerPersona = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  name: string;
  title: string;
  summary: string;
  demographics: Record<string, unknown>;
  pain_points: string[];
  behaviors: string[];
  motivations: string[];
  buying_triggers: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingWorkflow = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  name: string;
  status: MarketingWorkflowStatus;
  trigger_type: string;
  steps: Array<{ id: string; type: string; label: string; config: Record<string, unknown> }>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingAnalytics = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  channel: string;
  recorded_at: string;
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  revenue: number;
  spend: number;
  roi: number;
  engagement_rate: number;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type MarketingCalendarEvent = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  title: string;
  event_type: "campaign" | "content" | "launch" | "task" | "email" | "social" | "ads";
  scheduled_at: string;
  end_at: string | null;
  status: string;
  source: string;
  external_ref: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingEmailCampaign = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  template_id: string | null;
  audience_list_id: string | null;
  scheduled_at: string | null;
  body_html: string;
  body_text: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingEmailTemplate = {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  category: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingAudienceList = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  subscriber_count: number;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MarketingAdsDraft = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  platform: "google_ads" | "meta_ads";
  name: string;
  objective: string;
  status: "draft" | "ready" | "submitted";
  budget: number | null;
  audience: Record<string, unknown>;
  creative: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GeneratedMarketingCampaign = {
  name: string;
  objective: string;
  goals: string[];
  audience: string;
  offer: string;
  messaging: string;
  channels: MarketingChannel[];
  timeline: Array<{ label: string; date: string }>;
  kpis: Array<{ name: string; target: string }>;
  strategy: Record<string, unknown>;
};

export type GeneratedPersona = {
  name: string;
  title: string;
  summary: string;
  demographics: Record<string, unknown>;
  painPoints: string[];
  behaviors: string[];
  motivations: string[];
  buyingTriggers: string[];
};

export type MarketingAssistantAction =
  | "improve_campaign"
  | "rewrite_copy"
  | "generate_ideas"
  | "analyze_campaign"
  | "suggest_improvements";
