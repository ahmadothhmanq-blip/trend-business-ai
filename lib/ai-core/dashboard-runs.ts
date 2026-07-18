/**
 * Map ai_runs rows → dashboard summary cards (Phase 9).
 */

import { resolveAiCoreProduct } from "@/lib/ai-core/products";
import type { AiRunStatus, DashboardAiRunItem } from "@/types/database";

const PRODUCT_DASHBOARD_HREF: Record<string, string> = {
  "website-builder": "/dashboard/website-builder",
  "app-builder": "/dashboard/app-builder",
  "webapp-builder": "/dashboard/app-builder",
  "landing-page-builder": "/dashboard/landing-page-builder",
  "brand-designer": "/dashboard/brand-studio",
  "brand-identity": "/dashboard/brand-studio",
  "content-studio": "/dashboard/content-studio",
  "video-studio": "/dashboard/video-studio",
  "marketing-ai": "/dashboard/marketing",
  marketing: "/dashboard/marketing",
  "marketing-strategy": "/dashboard/marketing",
};

export type AiRunRow = {
  id: string;
  product_id: string;
  status: string;
  layers_executed?: string[] | null;
  artifacts?: Record<string, unknown> | null;
  created_at: string;
};

function qualityFromArtifacts(artifacts: Record<string, unknown> | null | undefined) {
  const quality = artifacts?.qualityReport;
  if (!quality || typeof quality !== "object") {
    return { score: null as number | null, publishReady: null as boolean | null };
  }
  const q = quality as { score?: number; publishReady?: boolean; passed?: boolean };
  return {
    score: typeof q.score === "number" ? q.score : null,
    publishReady:
      typeof q.publishReady === "boolean"
        ? q.publishReady
        : typeof q.passed === "boolean"
          ? q.passed
          : null,
  };
}

function titleFromArtifacts(
  productLabel: string,
  artifacts: Record<string, unknown> | null | undefined,
): string {
  const brief = artifacts?.brief;
  if (brief && typeof brief === "object") {
    const prompt = (brief as { prompt?: string }).prompt;
    if (typeof prompt === "string" && prompt.trim()) {
      return prompt.trim().slice(0, 72);
    }
  }
  const profile = artifacts?.businessProfile;
  if (profile && typeof profile === "object") {
    const name = (profile as { projectName?: string }).projectName;
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return `${productLabel} run`;
}

export function mapAiRunToDashboardItem(row: AiRunRow): DashboardAiRunItem {
  const resolved = resolveAiCoreProduct(row.product_id);
  const productId = resolved?.id ?? row.product_id;
  const productLabel = resolved?.label ?? row.product_id;
  const quality = qualityFromArtifacts(row.artifacts);
  return {
    id: row.id,
    productId,
    productLabel,
    status: row.status as AiRunStatus,
    title: titleFromArtifacts(productLabel, row.artifacts),
    layersExecuted: row.layers_executed ?? [],
    qualityScore: quality.score,
    publishReady: quality.publishReady,
    href: PRODUCT_DASHBOARD_HREF[productId] ?? PRODUCT_DASHBOARD_HREF[row.product_id] ?? "/dashboard",
    createdAt: row.created_at,
  };
}
