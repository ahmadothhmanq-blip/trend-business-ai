/**
 * Client-side publish orchestration — single entry point for /deploy mutations.
 */

import type { DeploymentDashboard } from "@/lib/ai-core/deployment";

export type WebsitePublishAction =
  | "prepare"
  | "publish"
  | "unpublish"
  | "archive"
  | "republish";

export type WebsitePublishQualityRecommendations = {
  seoScore?: number | null;
  performanceScore?: number | null;
  mobileScore?: number | null;
  conversionReady?: boolean | null;
  publishReady?: boolean | null;
  blockers?: string[];
  warnings?: string[];
  opportunities?: string[];
  score?: number | null;
};

export type WebsitePublishActionResult = {
  ok: boolean;
  status: number;
  error?: string;
  blockers?: string[];
  qualityRecommendations?: WebsitePublishQualityRecommendations;
  publication?: {
    status?: string;
    planned_public_url?: string | null;
    public_path?: string | null;
  };
  publicUrl?: string | null;
  message?: string;
  dashboard?: DeploymentDashboard;
};

export async function executeWebsitePublishAction(
  generationId: string,
  action: WebsitePublishAction,
  options?: { force?: boolean },
): Promise<WebsitePublishActionResult> {
  const response = await fetch(`/api/website-builder/${generationId}/deploy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      force: options?.force === true,
    }),
  });

  const data = (await response.json()) as Omit<
    WebsitePublishActionResult,
    "ok" | "status"
  > & { error?: string };

  return {
    ok: response.ok,
    status: response.status,
    ...data,
  };
}

export async function fetchWebsitePublicationStatus(generationId: string): Promise<{
  status: "none" | "prepared" | "published" | "unpublished";
  publicUrl: string | null;
}> {
  const response = await fetch(`/api/website-builder/${generationId}/deploy`);
  if (!response.ok) {
    return { status: "none", publicUrl: null };
  }
  const data = (await response.json()) as {
    dashboard?: {
      publishing?: {
        lifecycleStatus?: string;
        publicUrl?: string | null;
        publicPath?: string | null;
        backendStatus?: string;
      };
      primaryUrl?: string | null;
    };
  };
  const publishing = data.dashboard?.publishing;
  const backend = publishing?.backendStatus;
  const lifecycle = publishing?.lifecycleStatus;
  const status =
    backend === "published" || lifecycle === "published"
      ? "published"
      : backend === "prepared"
        ? "prepared"
        : backend === "unpublished"
          ? "unpublished"
          : "none";
  const publicUrl =
    status === "published"
      ? data.dashboard?.primaryUrl ??
        publishing?.publicUrl ??
        publishing?.publicPath ??
        null
      : publishing?.publicUrl ?? publishing?.publicPath ?? null;
  return { status, publicUrl };
}
