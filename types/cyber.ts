export type CyberSeverity = "critical" | "high" | "medium" | "low" | "info";

export type CyberAssetType = "device" | "server" | "application" | "cloud" | "network" | "other";

export type CyberAssetStatus = "active" | "inactive" | "decommissioned" | "at_risk";

export type CyberIocType = "ip" | "domain" | "hash" | "url" | "email" | "signature";

export type CyberAlertStatus = "open" | "investigating" | "resolved" | "false_positive";

export type CyberIncidentStatus = "open" | "investigating" | "contained" | "resolved" | "closed";

export type CyberCaseStatus = "open" | "in_progress" | "escalated" | "closed";

export type CyberScanStatus = "pending" | "running" | "completed" | "failed";

export type CyberAssistantAction =
  | "analyze_posture"
  | "explain_threat"
  | "summarize_incident"
  | "recommend_remediation"
  | "generate_security_report"
  | "risk_assessment"
  | "compliance_recommendations";

export type CyberAsset = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  asset_type: CyberAssetType;
  hostname: string;
  ip_address: string;
  owner: string;
  environment: string;
  status: CyberAssetStatus;
  risk_score: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CyberOrganization = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  industry: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CyberRole = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  permissions: string[];
  created_at: string;
};

export type CyberThreat = {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  description: string;
  severity: CyberSeverity;
  threat_type: string;
  source: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CyberIoc = {
  id: string;
  user_id: string;
  organization_id: string | null;
  threat_id: string | null;
  ioc_type: CyberIocType;
  value: string;
  confidence: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CyberFeed = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  feed_type: string;
  url: string;
  is_active: boolean;
  last_synced_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CyberThreatReport = {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  summary: string;
  recommendations: string[];
  payload: Record<string, unknown>;
  generated_at: string;
  created_at: string;
};

export type CyberEvent = {
  id: string;
  user_id: string;
  organization_id: string | null;
  asset_id: string | null;
  event_type: string;
  source: string;
  severity: CyberSeverity;
  message: string;
  payload: Record<string, unknown>;
  recorded_at: string;
  created_at: string;
};

export type CyberAlert = {
  id: string;
  user_id: string;
  organization_id: string | null;
  event_id: string | null;
  title: string;
  severity: CyberSeverity;
  status: CyberAlertStatus;
  assigned_to: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CyberDetectionRule = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  description: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CyberVulnerability = {
  id: string;
  user_id: string;
  organization_id: string | null;
  asset_id: string | null;
  cve_id: string;
  title: string;
  severity: CyberSeverity;
  cvss_score: number;
  status: string;
  remediation: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CyberScan = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  scan_type: string;
  status: CyberScanStatus;
  target: string;
  findings_count: number;
  started_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CyberFinding = {
  id: string;
  user_id: string;
  organization_id: string | null;
  scan_id: string | null;
  vulnerability_id: string | null;
  title: string;
  severity: CyberSeverity;
  description: string;
  remediation: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CyberIncident = {
  id: string;
  user_id: string;
  organization_id: string | null;
  title: string;
  description: string;
  severity: CyberSeverity;
  status: CyberIncidentStatus;
  assigned_to: string | null;
  detected_at: string;
  resolved_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CyberCase = {
  id: string;
  user_id: string;
  organization_id: string | null;
  incident_id: string | null;
  title: string;
  status: CyberCaseStatus;
  priority: string;
  assignee: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CyberPlaybook = {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  description: string;
  steps: Record<string, unknown>[];
  trigger_type: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CyberCaseEvent = {
  id: string;
  user_id: string;
  case_id: string;
  event_type: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CyberRiskScore = {
  id: string;
  user_id: string;
  organization_id: string | null;
  score: number;
  factors: Record<string, unknown>;
  recorded_at: string;
  created_at: string;
};

export type CyberMetric = {
  id: string;
  user_id: string;
  organization_id: string | null;
  metric_key: string;
  metric_value: number;
  period: string;
  recorded_at: string;
};

export type CyberAnalyticsSummary = {
  riskScore: number;
  activeThreats: number;
  openVulnerabilities: number;
  openIncidents: number;
  openAlerts: number;
  alertVolume24h: number;
  avgResponseTimeMs: number;
  assetCount: number;
  criticalFindings: number;
};

export type OsintResult = {
  id: string;
  user_id: string;
  organization_id: string | null;
  query: string;
  result_type: string;
  findings: Record<string, unknown>;
  created_at: string;
};
