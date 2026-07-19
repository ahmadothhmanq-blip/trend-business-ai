/**
 * AI Website Optimizer Engine — audit, score, improve.
 */

export type WebsiteQualityScore = {
  design: number;
  seo: number;
  ux: number;
  performance: number;
  overall: number;
};

export type AuditCategory =
  | "design"
  | "ux"
  | "content"
  | "sections"
  | "mobile"
  | "conversion"
  | "seo"
  | "performance"
  | "brand";

export type AuditIssueSeverity = "critical" | "major" | "minor";

export type WebsiteAuditIssue = {
  id: string;
  category: AuditCategory;
  severity: AuditIssueSeverity;
  title: string;
  detail: string;
  suggestion: string;
};

export type OptimizationImprovement = {
  id: string;
  category: AuditCategory;
  title: string;
  description: string;
  target?: string;
  applied: boolean;
};

export type WebsiteAuditResult = {
  scores: WebsiteQualityScore;
  issues: WebsiteAuditIssue[];
  missingSections: string[];
  suggestions: string[];
  brandConsistent: boolean;
  mobileReady: boolean;
  conversionReady: boolean;
  source: "heuristic" | "deepseek" | "hybrid";
};

export type WebsiteOptimizationReport = {
  summary: string;
  scores: WebsiteQualityScore;
  audit: WebsiteAuditResult;
  improvements: OptimizationImprovement[];
  appliedFixes: string[];
  improveInstruction?: string;
  publishReady: boolean;
};

export type RunWebsiteOptimizerResult = {
  report: WebsiteOptimizationReport;
  filesChanged: boolean;
  files: Array<{ path: string; content: string; language: string }>;
  auditId?: string;
  reportId?: string;
};
