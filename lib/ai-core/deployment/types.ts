/**
 * Deployment dashboard — publishing + domains + history.
 */

import type { PublishingSummary } from "@/lib/ai-core/publishing/types";
import type { WebsiteDomain } from "@/lib/ai-core/domains/types";

export type DeploymentEventKind =
  | "prepared"
  | "published"
  | "republished"
  | "unpublished"
  | "archived"
  | "domain_added"
  | "domain_verified"
  | "domain_removed"
  | "ssl_ready";

export type DeploymentHistoryEvent = {
  id: string;
  generationId: string;
  kind: DeploymentEventKind;
  message: string;
  url?: string | null;
  createdAt: string;
};

export type DeploymentDashboard = {
  generationId: string;
  projectName: string | null;
  publishing: PublishingSummary;
  domains: WebsiteDomain[];
  primaryUrl: string | null;
  customDomainUrl: string | null;
  subdomainUrl: string | null;
  sslStatus: "active" | "pending" | "na" | "error";
  history: DeploymentHistoryEvent[];
  analyticsReady: boolean;
  seoAgentReady: boolean;
  generatedAt: string;
};
