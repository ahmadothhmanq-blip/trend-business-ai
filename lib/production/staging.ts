/**
 * Staging readiness checks (Phase 12).
 * Ops validation only — does not change AI Core or product APIs.
 */

import type { ReadinessCheck, ReadinessLevel } from "@/lib/production/readiness";
import { evaluateProductionReadiness } from "@/lib/production/readiness";

export const STAGING_STORAGE_BUCKETS = [
  "avatars",
  "generation-uploads",
  "website-assets",
  "ai-assets",
] as const;

export type StagingMode = "local" | "preview" | "staging";

/**
 * Staging expects PayPal sandbox, real Supabase, and AI keys —
 * but allows http:// localhost and treats some prod-only rules as warnings.
 */
export function evaluateStagingReadiness(options?: {
  /** Fail closed on missing service role / AI / buckets metadata. */
  strict?: boolean;
}): ReadinessCheck[] {
  const strict = options?.strict ?? false;
  const base = evaluateProductionReadiness({ forceProduction: false });
  const checks: ReadinessCheck[] = [...base];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (siteUrl && !/^https?:\/\//i.test(siteUrl)) {
    checks.push({
      id: "staging_site_url_scheme",
      level: "fail",
      message: "NEXT_PUBLIC_SITE_URL must include http:// or https://",
    });
  }

  const paypalMode = process.env.PAYPAL_MODE?.trim().toLowerCase() ?? "sandbox";
  if (paypalMode === "live") {
    checks.push({
      id: "staging_paypal_mode",
      level: "warn",
      message:
        "PAYPAL_MODE=live on a staging-like env — prefer sandbox for pre-launch testing",
    });
  } else {
    checks.push({
      id: "staging_paypal_mode",
      level: "ok",
      message: `PayPal mode: ${paypalMode || "sandbox"}`,
    });
  }

  if (process.env.WEBSITE_PREVIEW_BUILDER_ENABLED === "true") {
    checks.push({
      id: "staging_preview_builder",
      level: "fail",
      message:
        "WEBSITE_PREVIEW_BUILDER_ENABLED must stay false on staging (RCE risk)",
    });
  }

  if (strict) {
    const bump = (id: string, message: string) => {
      const idx = checks.findIndex((c) => c.id === id);
      if (idx >= 0 && checks[idx].level !== "ok") {
        checks[idx] = { id, level: "fail" as ReadinessLevel, message };
      }
    };
    bump(
      "service_role",
      "SUPABASE_SERVICE_ROLE_KEY required for staging billing/credits/webhooks",
    );
    bump(
      "ai_provider",
      "DEEPSEEK_API_KEY (or OPENAI_API_KEY) required for staging generation tests",
    );
  }

  return checks;
}

export function stagingBucketChecklist(presentIds: string[]): ReadinessCheck[] {
  return STAGING_STORAGE_BUCKETS.map((id) => {
    const found = presentIds.includes(id);
    return {
      id: `bucket_${id}`,
      level: found ? ("ok" as const) : ("fail" as const),
      message: found
        ? `Storage bucket "${id}" present`
        : `Storage bucket "${id}" missing — apply migrations (007/011/032/033)`,
    };
  });
}
