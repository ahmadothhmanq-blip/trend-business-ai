export type BiDataSourceType = "crm" | "erp" | "marketing" | "social" | "business_manager" | "website" | "billing" | "custom";

export type BiWidgetType = "kpi" | "line" | "bar" | "table" | "trend";

export type BiAlertStatus = "active" | "paused" | "triggered";

export type BiScheduleFrequency = "daily" | "weekly" | "monthly";

export type BiAssistantAction =
  | "analyze_performance"
  | "explain_kpi"
  | "detect_trends"
  | "detect_anomalies"
  | "forecast_revenue"
  | "generate_executive_report"
  | "natural_language_query";

export type BiDataSource = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  source_type: BiDataSourceType;
  connection_config: Record<string, unknown>;
  is_active: boolean;
  last_synced_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiDataset = {
  id: string;
  user_id: string;
  organization_id: string | null;
  data_source_id: string | null;
  name: string;
  description: string;
  schema_definition: Record<string, unknown>;
  row_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiModel = {
  id: string;
  user_id: string;
  organization_id: string | null;
  dataset_id: string | null;
  name: string;
  model_type: string;
  definition: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiMetric = {
  id: string;
  user_id: string;
  organization_id: string | null;
  dataset_id: string | null;
  key: string;
  label: string;
  formula: string;
  unit: string;
  aggregation: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiDimension = {
  id: string;
  user_id: string;
  organization_id: string | null;
  dataset_id: string | null;
  key: string;
  label: string;
  data_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiKpi = {
  id: string;
  user_id: string;
  organization_id: string | null;
  metric_id: string | null;
  name: string;
  target_value: number;
  current_value: number;
  unit: string;
  period: string;
  trend_direction: "up" | "down" | "flat";
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiDashboard = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  description: string;
  layout: Record<string, unknown>;
  filters: Record<string, unknown>;
  is_default: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiWidget = {
  id: string;
  user_id: string;
  organization_id: string | null;
  dashboard_id: string;
  title: string;
  widget_type: BiWidgetType;
  metric_key: string;
  config: Record<string, unknown>;
  position: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiReport = {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  report_type: string;
  payload: Record<string, unknown>;
  generated_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiScheduledReport = {
  id: string;
  user_id: string;
  organization_id: string | null;
  report_id: string | null;
  title: string;
  frequency: BiScheduleFrequency;
  next_run_at: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiQuery = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  query_text: string;
  dataset_id: string | null;
  result_cache: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BiAlert = {
  id: string;
  user_id: string;
  organization_id: string | null;
  metric_key: string;
  name: string;
  condition: string;
  threshold: number;
  status: BiAlertStatus;
  last_triggered_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
