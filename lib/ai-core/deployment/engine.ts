/**
 * Build deployment dashboard aggregating publish + domains + history.
 */

import type { WebsitePublication } from "@/lib/website/publish";
import { buildPublishingSummary } from "@/lib/ai-core/publishing";
import {
  ensurePlatformSubdomain,
  listDomainsForGeneration,
  type WebsiteDomain,
} from "@/lib/ai-core/domains";
import {
  listDeploymentHistory,
  recordDeploymentEvent,
} from "@/lib/ai-core/deployment/history";
import type { DeploymentDashboard } from "@/lib/ai-core/deployment/types";

export function buildDeploymentDashboard(params: {
  generationId: string;
  projectName?: string | null;
  publication?: WebsitePublication | null;
  userId: string;
  userHandle?: string | null;
  hasAnalytics?: boolean;
  hasSeoAgent?: boolean;
}): DeploymentDashboard {
  const publishing = buildPublishingSummary({
    generationId: params.generationId,
    publication: params.publication,
    userHandle: params.userHandle,
  });

  if (params.userHandle) {
    ensurePlatformSubdomain({
      userId: params.userId,
      generationId: params.generationId,
      handle: params.userHandle,
      publicationId: params.publication?.id,
      slug: params.publication?.slug,
    });
  }

  const domains = listDomainsForGeneration(params.generationId);
  let history = listDeploymentHistory(params.generationId);

  // Seed a helpful history entry when empty
  if (!history.length && params.publication) {
    recordDeploymentEvent({
      generationId: params.generationId,
      kind:
        params.publication.status === "published"
          ? "published"
          : params.publication.status === "unpublished"
            ? "archived"
            : "prepared",
      message: `Publication status: ${params.publication.status}`,
      url: params.publication.planned_public_url,
    });
    history = listDeploymentHistory(params.generationId);
  }

  const activeCustom = domains.find(
    (d) => d.kind === "custom" && d.status === "active",
  );
  const subdomain = domains.find((d) => d.kind === "subdomain");

  const customDomainUrl = activeCustom
    ? `https://${activeCustom.hostname}`
    : null;

  const primaryUrl =
    customDomainUrl ||
    publishing.publicUrl ||
    publishing.subdomainUrl ||
    (subdomain ? `https://${subdomain.hostname}` : null);

  const sslStatus = resolveSslStatus(publishing.sslStatus, domains);

  return {
    generationId: params.generationId,
    projectName: params.projectName ?? publishing.title,
    publishing,
    domains,
    primaryUrl,
    customDomainUrl,
    subdomainUrl: publishing.subdomainUrl,
    sslStatus,
    history,
    analyticsReady: Boolean(params.hasAnalytics),
    seoAgentReady: Boolean(params.hasSeoAgent),
    generatedAt: new Date().toISOString(),
  };
}

function resolveSslStatus(
  publishSsl: "active" | "pending" | "na",
  domains: WebsiteDomain[],
): DeploymentDashboard["sslStatus"] {
  const custom = domains.filter((d) => d.kind === "custom" && d.status !== "removed");
  if (custom.some((d) => d.sslStatus === "error")) return "error";
  if (custom.some((d) => d.status === "active" && d.sslStatus === "active")) {
    return "active";
  }
  if (custom.some((d) => d.sslStatus === "pending" || d.sslStatus === "provisioning")) {
    return "pending";
  }
  if (publishSsl === "active") return "active";
  if (publishSsl === "pending") return "pending";
  return "na";
}
