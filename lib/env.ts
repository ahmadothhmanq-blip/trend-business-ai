type RequiredEnvName =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_SITE_URL";

function trimEnv(value: string | undefined) {
  return value?.trim().replace(/\/+$/, "");
}

export function getRequiredEnv(name: RequiredEnvName): string {
  const value = trimEnv(process.env[name]);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export {
  evaluateProductionReadiness,
  readinessSummary,
  type ReadinessCheck,
  type ReadinessLevel,
} from "@/lib/production/readiness";

export function getSupabaseEnv() {
  return {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getRequiredSiteUrl() {
  return getRequiredEnv("NEXT_PUBLIC_SITE_URL");
}

export function getOptionalSiteUrl(fallback = "http://localhost:3000") {
  const configuredUrl = trimEnv(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredUrl) return configuredUrl;

  const vercelUrl = trimEnv(process.env.VERCEL_URL);
  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  // Fail closed on Vercel production — localhost fallback would poison SEO/canonicals.
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SITE_URL");
  }

  return fallback;
}

/** True when distributed rate limiting (Upstash) is configured. */
export function isDistributedRateLimitConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}
