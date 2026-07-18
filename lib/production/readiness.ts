/**
 * Production readiness checks (Phase 10).
 * Does not change product APIs — ops validation only.
 */

import { getPayPalConfig, isBillingConfigured } from "@/lib/billing/config";
import { isDistributedRateLimitConfigured } from "@/lib/env";

export type ReadinessLevel = "ok" | "warn" | "fail";

export type ReadinessCheck = {
  id: string;
  level: ReadinessLevel;
  message: string;
};

function isProductionRuntime() {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

function has(name: string) {
  return Boolean(process.env[name]?.trim());
}

/**
 * Evaluate launch readiness. Safe to call at verify-time or health diagnostics.
 */
export function evaluateProductionReadiness(options?: {
  /** Treat as production even when NODE_ENV is development (verify scripts). */
  forceProduction?: boolean;
}): ReadinessCheck[] {
  const production = options?.forceProduction || isProductionRuntime();
  const checks: ReadinessCheck[] = [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!siteUrl) {
    checks.push({
      id: "site_url",
      level: production ? "fail" : "warn",
      message: "NEXT_PUBLIC_SITE_URL is required for canonical URLs and auth redirects",
    });
  } else if (production && !siteUrl.startsWith("https://")) {
    checks.push({
      id: "site_url_https",
      level: "fail",
      message: "NEXT_PUBLIC_SITE_URL must use https:// in production",
    });
  } else {
    checks.push({
      id: "site_url",
      level: "ok",
      message: "NEXT_PUBLIC_SITE_URL configured",
    });
  }

  if (!has("NEXT_PUBLIC_SUPABASE_URL") || !has("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    checks.push({
      id: "supabase_public",
      level: "fail",
      message: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required",
    });
  } else {
    checks.push({
      id: "supabase_public",
      level: "ok",
      message: "Supabase public client env configured",
    });
  }

  if (!has("SUPABASE_SERVICE_ROLE_KEY")) {
    checks.push({
      id: "service_role",
      level: production ? "fail" : "warn",
      message:
        "SUPABASE_SERVICE_ROLE_KEY required for billing credits, webhooks, and admin writes",
    });
  } else {
    checks.push({
      id: "service_role",
      level: "ok",
      message: "Service role key configured",
    });
  }

  if (!has("DEEPSEEK_API_KEY") && !has("OPENAI_API_KEY")) {
    checks.push({
      id: "ai_provider",
      level: production ? "fail" : "warn",
      message: "Set DEEPSEEK_API_KEY (recommended) or OPENAI_API_KEY for generation",
    });
  } else {
    checks.push({
      id: "ai_provider",
      level: "ok",
      message: "AI provider key present",
    });
  }

  const billingOptional = process.env.BILLING_OPTIONAL === "true";
  if (production && billingOptional) {
    checks.push({
      id: "billing_optional",
      level: "fail",
      message: "BILLING_OPTIONAL must not be true in production",
    });
  }

  if (isBillingConfigured()) {
    const paypal = getPayPalConfig();
    checks.push({
      id: "billing",
      level: "ok",
      message: `Billing configured (PayPal ${paypal.mode}; card via PayPal hosted)`,
    });
    if (!paypal.webhookId) {
      checks.push({
        id: "paypal_webhook",
        level: production ? "warn" : "ok",
        message: "PAYPAL_WEBHOOK_ID missing — set for reliable subscription/credit grants",
      });
    }
  } else {
    checks.push({
      id: "billing",
      level: production ? "warn" : "ok",
      message:
        "PayPal not configured — Free plan works; paid checkout disabled until PAYPAL_* set",
    });
  }

  if (process.env.ALLOW_INSECURE_PAYPAL_WEBHOOKS === "true") {
    checks.push({
      id: "paypal_insecure",
      level: production ? "fail" : "warn",
      message: "ALLOW_INSECURE_PAYPAL_WEBHOOKS must be false in production",
    });
  }

  if (!isDistributedRateLimitConfigured()) {
    checks.push({
      id: "upstash",
      level: production ? "warn" : "ok",
      message:
        "Upstash unset — AI rate limits fall back to per-instance memory (set UPSTASH_* for multi-instance)",
    });
  } else {
    checks.push({
      id: "upstash",
      level: "ok",
      message: "Distributed rate limiting configured",
    });
  }

  if (process.env.WEBSITE_PREVIEW_BUILDER_ENABLED === "true" && production) {
    checks.push({
      id: "preview_builder",
      level: "fail",
      message: "WEBSITE_PREVIEW_BUILDER_ENABLED must stay false in production",
    });
  }

  if (!has("SENTRY_DSN") && !has("NEXT_PUBLIC_SENTRY_DSN")) {
    checks.push({
      id: "error_monitoring",
      level: "warn",
      message:
        "No Sentry DSN — errors use structured logger only (see docs/PRODUCTION_LAUNCH.md)",
    });
  } else {
    checks.push({
      id: "error_monitoring",
      level: "ok",
      message: "Error monitoring DSN present",
    });
  }

  return checks;
}

export function readinessSummary(checks: ReadinessCheck[]) {
  const fail = checks.filter((c) => c.level === "fail").length;
  const warn = checks.filter((c) => c.level === "warn").length;
  const ok = checks.filter((c) => c.level === "ok").length;
  return {
    ready: fail === 0,
    fail,
    warn,
    ok,
    checks,
  };
}
