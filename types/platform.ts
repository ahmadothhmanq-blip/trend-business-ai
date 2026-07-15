/* ------------------------------------------------------------------ */
/*  Organizations & Teams                                              */
/* ------------------------------------------------------------------ */

export type OrgRole = "owner" | "admin" | "member" | "viewer";
export type OrgPlan = "free" | "starter" | "pro" | "enterprise";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: OrgPlan;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type OrgMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  joined_at: string;
  profile?: { full_name: string | null; avatar_url: string | null; email?: string };
};

export type TeamInvitation = {
  id: string;
  organization_id: string;
  email: string;
  role: OrgRole;
  invited_by: string;
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expires_at: string;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */

export type NotificationType = "info" | "success" | "warning" | "error" | "invite" | "system";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/*  Activity / Audit Log                                               */
/* ------------------------------------------------------------------ */

export type ActivityLogEntry = {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/*  API Keys                                                           */
/* ------------------------------------------------------------------ */

export type ApiKey = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/*  Webhooks                                                           */
/* ------------------------------------------------------------------ */

export type Webhook = {
  id: string;
  user_id: string;
  organization_id: string | null;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  last_triggered_at: string | null;
  failure_count: number;
  created_at: string;
  updated_at: string;
};

/* ------------------------------------------------------------------ */
/*  Usage                                                              */
/* ------------------------------------------------------------------ */

export type UsageRecord = {
  id: string;
  user_id: string;
  organization_id: string | null;
  resource: string;
  tokens_used: number;
  generations_count: number;
  provider: string | null;
  period_start: string;
  period_end: string;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/*  Feature Flags                                                      */
/* ------------------------------------------------------------------ */

export type FeatureFlag = {
  id: string;
  key: string;
  name: string;
  description: string;
  is_enabled: boolean;
  target_plans: string[];
  target_users: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/* ------------------------------------------------------------------ */
/*  Subscription Plans                                                 */
/* ------------------------------------------------------------------ */

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Record<string, number>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};
