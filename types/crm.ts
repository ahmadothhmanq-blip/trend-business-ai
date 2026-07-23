export type CRMLifecycleStage =
  | "subscriber"
  | "lead"
  | "mql"
  | "sql"
  | "opportunity"
  | "customer"
  | "churned";

export type CRMLeadStatus = "new" | "contacted" | "qualified" | "nurturing" | "converted" | "lost";

export type CRMDealStageKey = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export type CRMTaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export type CRMActivityType = "call" | "meeting" | "email" | "note" | "task" | "system";

export type CRMRoleType = "owner" | "admin" | "sales" | "viewer";

export type CRMAssistantAction =
  | "analyze_customer"
  | "score_lead"
  | "suggest_next_action"
  | "summarize_history"
  | "generate_sales_email"
  | "improve_deal_strategy";

export type CRMAccount = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  industry: string;
  size: string;
  website: string;
  notes: string;
  custom_fields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMContact = {
  id: string;
  user_id: string;
  organization_id: string | null;
  account_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  title: string;
  lifecycle_stage: CRMLifecycleStage;
  tags: string[];
  custom_fields: Record<string, unknown>;
  owner_name: string;
  owner_email: string;
  lead_id: string | null;
  growth_contact_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMLead = {
  id: string;
  user_id: string;
  organization_id: string | null;
  email: string;
  name: string;
  company: string;
  phone: string;
  source: string;
  status: CRMLeadStatus;
  score: number;
  assignee_name: string;
  assignee_email: string;
  message: string;
  growth_lead_id: string | null;
  converted_contact_id: string | null;
  converted_deal_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMDeal = {
  id: string;
  user_id: string;
  organization_id: string | null;
  account_id: string | null;
  contact_id: string | null;
  lead_id: string | null;
  title: string;
  stage: CRMDealStageKey;
  value_cents: number;
  currency: string;
  probability: number;
  expected_close_at: string | null;
  owner_name: string;
  owner_email: string;
  notes: string;
  growth_deal_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMStage = {
  id: string;
  user_id: string;
  organization_id: string | null;
  key: CRMDealStageKey;
  label: string;
  sort_order: number;
  probability_default: number;
  is_closed: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMTask = {
  id: string;
  user_id: string;
  organization_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  account_id: string | null;
  title: string;
  description: string;
  status: CRMTaskStatus;
  priority: string;
  assignee_name: string;
  assignee_email: string;
  due_date: string | null;
  reminder_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMActivity = {
  id: string;
  user_id: string;
  organization_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  account_id: string | null;
  lead_id: string | null;
  activity_type: CRMActivityType;
  subject: string;
  body: string;
  occurred_at: string;
  duration_minutes: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMNote = {
  id: string;
  user_id: string;
  organization_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  account_id: string | null;
  body: string;
  author_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMAssignment = {
  id: string;
  user_id: string;
  organization_id: string | null;
  entity_type: "lead" | "contact" | "deal" | "account" | "task";
  entity_id: string;
  assignee_name: string;
  assignee_email: string;
  role: CRMRoleType;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMAutomationRule = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  trigger_event: string;
  status: "active" | "paused" | "archived";
  conditions: Record<string, unknown>;
  actions: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CRMAnalyticsSnapshot = {
  id: string;
  user_id: string;
  organization_id: string | null;
  period_start: string;
  period_end: string;
  pipeline_value_cents: number;
  won_value_cents: number;
  conversion_rate: number;
  win_rate: number;
  avg_sales_cycle_days: number;
  forecast_cents: number;
  metrics: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
