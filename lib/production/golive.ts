/**
 * Production go-live readiness (Phase 13).
 * Ops validation only — does not change AI Core or product APIs.
 */

import {
  evaluateProductionReadiness,
  type ReadinessCheck,
} from "@/lib/production/readiness";
import { getPayPalConfig, isBillingConfigured } from "@/lib/billing/config";
import { STAGING_STORAGE_BUCKETS } from "@/lib/production/staging";
import { isErrorMonitoringConfigured } from "@/lib/monitoring/errors";

/** Storage buckets required for production launch. */
export const PRODUCTION_STORAGE_BUCKETS = STAGING_STORAGE_BUCKETS;

/** Critical migrations that must be applied before go-live. */
export const PRODUCTION_CRITICAL_MIGRATIONS = [
  "001_profiles.sql",
  "007_storage_avatars.sql",
  "008_website_generations.sql",
  "011_ai_engine_phase5.sql",
  "013_webapp_generations.sql",
  "014_landing_page_generations.sql",
  "016_brand_identity_generations.sql",
  "018_video_generations.sql",
  "019_content_studio.sql",
  "010_workspace_generations.sql",
  "025_billing_system.sql",
  "028_production_qa_fixes.sql",
  "031_website_publications.sql",
  "032_website_design_engine_artifacts.sql",
  "033_ai_runs.sql",
] as const;

export const CORE_UAT_PRODUCTS = [
  {
    id: "website-builder",
    dashboard: "/dashboard/website-builder",
    api: "/api/website-builder",
    export: "ZIP + publish /w/[slug]",
  },
  {
    id: "app-builder",
    dashboard: "/dashboard/app-builder",
    api: "/api/webapp-builder",
    export: "ZIP",
  },
  {
    id: "landing-page-builder",
    dashboard: "/dashboard/landing-page-builder",
    api: "/api/landing-page-builder",
    export: "ZIP",
  },
  {
    id: "video-studio",
    dashboard: "/dashboard/video-studio",
    api: "/api/video-studio",
    export: "ZIP package (not MP4)",
  },
  {
    id: "brand-designer",
    dashboard: "/dashboard/brand-studio",
    api: "/api/brand-identity",
    export: "Brand-kit ZIP",
  },
  {
    id: "content-studio",
    dashboard: "/dashboard/content-studio",
    api: "/api/content-studio",
    export: "Content ZIP",
  },
  {
    id: "marketing-ai",
    dashboard: "/dashboard/marketing",
    api: "/api/workspaces/marketing",
    export: "MD/JSON/PDF/DOCX",
  },
] as const;

/**
 * Production go-live evaluation (stricter billing / monitoring expectations).
 */
export function evaluateGoLiveReadiness(options?: {
  forceProduction?: boolean;
  /** Require PayPal live for paid day-one launch. */
  requirePaidBilling?: boolean;
}): ReadinessCheck[] {
  const forceProduction = options?.forceProduction ?? true;
  const requirePaid = options?.requirePaidBilling ?? false;
  const checks = evaluateProductionReadiness({ forceProduction });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
    checks.push({
      id: "golive_site_url_host",
      level: "fail",
      message: "NEXT_PUBLIC_SITE_URL must be the public production domain (not localhost)",
    });
  }

  const paypal = getPayPalConfig();
  if (isBillingConfigured()) {
    if (paypal.mode !== "live" && requirePaid) {
      checks.push({
        id: "golive_paypal_live",
        level: "fail",
        message: "PAYPAL_MODE must be live for paid production go-live",
      });
    } else if (paypal.mode !== "live") {
      checks.push({
        id: "golive_paypal_live",
        level: "warn",
        message: "PAYPAL_MODE is sandbox — switch to live before taking real payments",
      });
    } else {
      checks.push({
        id: "golive_paypal_live",
        level: "ok",
        message: "PayPal live mode configured",
      });
    }
    if (!paypal.webhookId) {
      checks.push({
        id: "golive_paypal_webhook",
        level: requirePaid ? "fail" : "warn",
        message: "PAYPAL_WEBHOOK_ID required for reliable credit/subscription grants",
      });
    }
  } else if (requirePaid) {
    checks.push({
      id: "golive_billing",
      level: "fail",
      message: "PayPal not configured — paid go-live blocked",
    });
  }

  if (!isErrorMonitoringConfigured()) {
    checks.push({
      id: "golive_monitoring",
      level: "warn",
      message: "No Sentry DSN — rely on host logs + structured logger at launch",
    });
  } else {
    checks.push({
      id: "golive_monitoring",
      level: "ok",
      message: "Error monitoring DSN present",
    });
  }

  return checks;
}
