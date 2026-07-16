export type AffiliateStatus = "pending" | "active" | "paused" | "rejected";
export type CommissionStatus = "pending" | "approved" | "paid" | "rejected" | "canceled";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "canceled";
export type ReferralInviteStatus = "pending" | "accepted" | "expired" | "canceled";
export type LeadSource =
  | "website"
  | "contact"
  | "newsletter"
  | "exit_intent"
  | "cta"
  | "affiliate"
  | "referral"
  | "import"
  | "other";
export type LeadStatus = "new" | "contacted" | "qualified" | "nurturing" | "won" | "lost";
export type LifecycleStage =
  | "subscriber"
  | "lead"
  | "mql"
  | "sql"
  | "opportunity"
  | "customer"
  | "churned";
export type DealStage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "canceled";
export type AutomationTrigger =
  | "lead_created"
  | "subscriber_added"
  | "deal_stage_changed"
  | "user_signed_up"
  | "custom";
export type ExperimentTarget = "landing" | "headline" | "cta" | "pricing" | "other";
export type ExperimentStatus = "draft" | "running" | "paused" | "completed" | "archived";

export type GrowthAffiliate = {
  id: string;
  user_id: string;
  code: string;
  status: AffiliateStatus;
  commission_rate_bps: number;
  payout_email: string | null;
  total_clicks: number;
  total_referrals: number;
  total_earned_cents: number;
  total_paid_cents: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthAffiliateCommission = {
  id: string;
  affiliate_id: string;
  user_id: string;
  referred_user_id: string | null;
  referral_email: string | null;
  event_type: "signup" | "subscribe" | "purchase" | "custom";
  amount_cents: number;
  status: CommissionStatus;
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthAffiliatePayout = {
  id: string;
  affiliate_id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  status: PayoutStatus;
  method: "paypal" | "bank" | "credits" | "other";
  reference: string | null;
  paid_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthReferralCode = {
  id: string;
  user_id: string;
  code: string;
  reward_credits: number;
  invitee_reward_credits: number;
  total_invites: number;
  total_accepted: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthReferralInvite = {
  id: string;
  referrer_user_id: string;
  code: string;
  invitee_email: string;
  invitee_user_id: string | null;
  status: ReferralInviteStatus;
  reward_granted: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  accepted_at: string | null;
};

export type GrowthLead = {
  id: string;
  owner_user_id: string | null;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  tags: string[];
  message: string | null;
  page_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  affiliate_code: string | null;
  referral_code: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthContact = {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  lifecycle_stage: LifecycleStage;
  score: number;
  tags: string[];
  lead_id: string | null;
  last_seen_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthDeal = {
  id: string;
  user_id: string;
  contact_id: string | null;
  title: string;
  stage: DealStage;
  value_cents: number;
  currency: string;
  probability: number;
  expected_close_at: string | null;
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthSubscriber = {
  id: string;
  owner_user_id: string | null;
  email: string;
  name: string | null;
  status: "subscribed" | "unsubscribed" | "bounced" | "complained";
  source: string;
  tags: string[];
  metadata: Record<string, unknown>;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

export type GrowthEmailCampaign = {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  preview_text: string;
  body_html: string;
  body_text: string;
  status: CampaignStatus;
  segment: string;
  scheduled_at: string | null;
  sent_at: string | null;
  stats: { sent: number; opened: number; clicked: number; bounced: number };
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthAutomationStep = {
  id: string;
  type: "email" | "wait" | "tag" | "score" | "webhook";
  delayHours?: number;
  subject?: string;
  body?: string;
  tag?: string;
  scoreDelta?: number;
};

export type GrowthAutomation = {
  id: string;
  user_id: string;
  name: string;
  trigger_event: AutomationTrigger;
  status: "active" | "paused" | "archived";
  steps: GrowthAutomationStep[];
  segment_rules: Record<string, unknown>;
  stats: { enrolled: number; completed: number };
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthExperimentVariant = {
  id: string;
  label: string;
  value: string;
  weight: number;
};

export type GrowthExperiment = {
  id: string;
  user_id: string;
  name: string;
  hypothesis: string;
  target_type: ExperimentTarget;
  status: ExperimentStatus;
  variants: GrowthExperimentVariant[];
  traffic_allocation: Record<string, number>;
  metrics: { impressions: number; conversions: number };
  winner_variant_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthSegment = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  rules: Record<string, unknown>;
  member_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type GrowthAnalyticsSummary = {
  pageviews: number;
  conversions: number;
  leads: number;
  subscribers: number;
  affiliateClicks: number;
  experimentsRunning: number;
  funnel: Array<{ step: string; count: number }>;
  campaigns: Array<{ id: string; name: string; sent: number; opened: number; clicked: number }>;
};

export type GrowthDashboardPayload = {
  affiliate: GrowthAffiliate | null;
  commissions: GrowthAffiliateCommission[];
  payouts: GrowthAffiliatePayout[];
  referral: GrowthReferralCode | null;
  invites: GrowthReferralInvite[];
  leads: GrowthLead[];
  contacts: GrowthContact[];
  deals: GrowthDeal[];
  subscribers: GrowthSubscriber[];
  campaigns: GrowthEmailCampaign[];
  automations: GrowthAutomation[];
  experiments: GrowthExperiment[];
  segments: GrowthSegment[];
  analytics: GrowthAnalyticsSummary;
};
