"use client";

import { useCallback, useEffect, useState } from "react";
import type { DeploymentDashboard } from "@/lib/ai-core/deployment";
import {
  executeWebsitePublishAction,
  fetchWebsitePublicationStatus,
  type WebsitePublishAction,
  type WebsitePublishQualityRecommendations,
} from "@/lib/website/publish-action-client";

export type WebsitePublicationStatus =
  | "none"
  | "prepared"
  | "published"
  | "unpublished";

export type WebsitePublishQualityState = {
  seoScore?: number | null;
  performanceScore?: number | null;
  mobileScore?: number | null;
  conversionReady?: boolean | null;
  blockers: string[];
  warnings: string[];
  opportunities: string[];
};

export function useWebsitePublish(generationId: string | null) {
  const [status, setStatus] = useState<WebsitePublicationStatus>("none");
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<WebsitePublishAction | null>(null);
  const [quality, setQuality] = useState<WebsitePublishQualityState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyQuality = useCallback(
    (qr?: WebsitePublishQualityRecommendations, blockers?: string[]) => {
      if (!qr && !blockers?.length) return;
      setQuality({
        seoScore: qr?.seoScore ?? null,
        performanceScore: qr?.performanceScore ?? null,
        mobileScore: qr?.mobileScore ?? null,
        conversionReady: qr?.conversionReady ?? null,
        blockers: qr?.blockers ?? blockers ?? [],
        warnings: qr?.warnings ?? [],
        opportunities: qr?.opportunities ?? [],
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!generationId) {
      setStatus("none");
      setPublicUrl(null);
      setQuality(null);
      setError(null);
      return;
    }
    try {
      const result = await fetchWebsitePublicationStatus(generationId);
      setStatus(result.status);
      setPublicUrl(result.publicUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load publication status");
    }
  }, [generationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = useCallback(
    async (
      action: WebsitePublishAction,
      options?: { force?: boolean },
    ): Promise<{
      ok: boolean;
      dashboard?: DeploymentDashboard;
      publicUrl?: string | null;
      message?: string;
      error?: string;
      blockers?: string[];
      status?: number;
    }> => {
      if (!generationId) {
        return { ok: false, error: "No project selected" };
      }
      setBusy(action);
      setError(null);
      try {
        const data = await executeWebsitePublishAction(generationId, action, options);
        applyQuality(data.qualityRecommendations, data.blockers);

        if (!data.ok) {
          const message =
            data.blockers?.[0] ?? data.error ?? "Publish action failed";
          setError(message);
          return {
            ok: false,
            error: message,
            blockers: data.blockers,
            status: data.status,
          };
        }

        const lifecycle = (data.publication?.status ?? action) as string;
        setStatus(
          lifecycle === "published"
            ? "published"
            : lifecycle === "prepared"
              ? "prepared"
              : lifecycle === "unpublished"
                ? "unpublished"
                : "none",
        );
        const url =
          data.publicUrl ??
          data.publication?.planned_public_url ??
          data.publication?.public_path ??
          null;
        setPublicUrl(url);

        return {
          ok: true,
          dashboard: data.dashboard,
          publicUrl: url,
          message: data.message,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Publish action failed";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setBusy(null);
      }
    },
    [applyQuality, generationId],
  );

  return {
    status,
    publicUrl,
    busy,
    quality,
    error,
    refresh,
    runAction,
    isBusy: busy !== null,
  };
}
