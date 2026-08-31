export type PublishGateSeverity = "error" | "warning" | "info" | "blocker";

export type PublishGateCheckId =
  | "seo-meta"
  | "seo-schema"
  | "seo-sitemap"
  | "content-quality"
  | "accessibility"
  | "performance"
  | "industry-images";

export type PublishGateCheck = {
  id: PublishGateCheckId;
  passed: boolean;
  severity: PublishGateSeverity;
  message: string;
  details?: string;
};

export type PublishGateResult = {
  passed: boolean;
  checks: PublishGateCheck[];
  evaluatedAt: string;
};
