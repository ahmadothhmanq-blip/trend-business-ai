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
  return trimEnv(process.env.NEXT_PUBLIC_SITE_URL) || fallback;
}
