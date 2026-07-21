export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "messenger"
  | "linkedin"
  | "x"
  | "tiktok";

export type SocialPostPlatform = "facebook" | "instagram" | "linkedin" | "x" | "tiktok";

export type SocialPostStatus = "draft" | "scheduled" | "published" | "failed" | "archived";

export type SocialCampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";

export type SocialScheduleStatus = "pending" | "queued" | "published" | "failed" | "cancelled";

export type SocialConnectionStatus = "connected" | "disconnected" | "expired" | "error" | "revoked";

export type SocialAccountStatus = SocialConnectionStatus;

export type SocialPublishJobStatus =
  | "pending"
  | "queued"
  | "processing"
  | "published"
  | "failed"
  | "cancelled";

export type SocialTone =
  | "Professional"
  | "Casual"
  | "Luxury"
  | "Marketing"
  | "Friendly"
  | "Technical";

export type SocialPostAction =
  | "rewrite"
  | "improve_engagement"
  | "shorten"
  | "expand"
  | "translate"
  | "generate_variations";

export type SocialTemplateCategory =
  | "Product promotion"
  | "Sales campaign"
  | "Brand awareness"
  | "Educational posts"
  | "Restaurant"
  | "E-commerce"
  | "Real estate"
  | "Personal brand";

export type SocialTemplateVariable = {
  key: string;
  label: string;
  placeholder?: string;
  default?: string;
};

export type SocialAccount = {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  account_id: string;
  account_name: string;
  account_handle: string;
  status: SocialAccountStatus;
  connection_status: SocialConnectionStatus;
  expires_at: string | null;
  token_expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/** Safe account shape — never includes encrypted tokens */
export type SocialAccountPublic = SocialAccount;

export type SocialCampaign = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: SocialCampaignStatus;
  platforms: string[];
  start_date: string | null;
  end_date: string | null;
  goals: string[];
  brand_identity_id: string | null;
  is_favorite: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SocialPost = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  platform: SocialPostPlatform;
  status: SocialPostStatus;
  title: string;
  post_text: string;
  caption: string;
  hashtags: string[];
  cta: string;
  content_angle: string;
  tone: string;
  language: string;
  recommended_post_time: string;
  media_url: string | null;
  media_width: number | null;
  media_height: number | null;
  template_id: string | null;
  brand_identity_id: string | null;
  image_generation_id: string | null;
  workspace_generation_id: string | null;
  is_favorite: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SocialSchedule = {
  id: string;
  user_id: string;
  post_id: string;
  account_id: string | null;
  scheduled_at: string;
  timezone: string;
  status: SocialScheduleStatus;
  publish_attempts: number;
  last_error: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SocialAnalytics = {
  id: string;
  user_id: string;
  post_id: string | null;
  campaign_id: string | null;
  platform: string;
  recorded_at: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type SocialPublishJob = {
  id: string;
  user_id: string;
  post_id: string;
  account_id: string | null;
  platform: string;
  status: SocialPublishJobStatus;
  scheduled_at: string;
  published_at: string | null;
  attempts: number;
  max_attempts: number;
  error: string;
  platform_post_id: string;
  platform_response: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GeneratedSocialPost = {
  postText: string;
  caption: string;
  hashtags: string[];
  cta: string;
  contentAngle: string;
  recommendedPostTime: string;
  title: string;
};

export type SocialBrandContext = {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  voiceTone: string;
  tagline: string;
};

export type SocialMediaDimension = {
  id: string;
  label: string;
  platform: SocialPostPlatform;
  width: number;
  height: number;
};
