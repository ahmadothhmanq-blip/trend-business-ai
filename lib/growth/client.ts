import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/** Anon client for public growth ingest (respects RLS). */
export function createGrowthAnonClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Prefer anon + RLS for public writes.
 * Service role only for privileged server jobs (not public event/lead spam paths).
 */
export function createGrowthWriteClient(preferServiceRole = false) {
  if (preferServiceRole) {
    const admin = createAdminClient();
    if (admin) return { client: admin, mode: "service" as const };
  }
  return { client: createGrowthAnonClient(), mode: "anon" as const };
}
