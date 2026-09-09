/**
 * Auth + rate-limit gate for App Builder design-platform API.
 * Catalog/engine endpoints have no per-resource ownership; authentication is required.
 */

import { requireUser } from "@/lib/api/helpers";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";

export type DesignPlatformAccessDeps = {
  requireUser: typeof requireUser;
  enforceRateLimit: (userId: string) => Promise<NextResponse | null>;
};

const defaultDeps: DesignPlatformAccessDeps = {
  requireUser,
  enforceRateLimit: enforceMutationRateLimitAsync,
};

export type DesignPlatformAccessResult =
  | {
      ok: true;
      user: User;
      supabase: SupabaseClient;
      response: null;
    }
  | {
      ok: false;
      user: User | null;
      supabase: SupabaseClient;
      response: NextResponse;
    };

/**
 * Require an authenticated user and apply the shared mutation rate limiter.
 * Returns 401 via requireUser when unauthenticated; rate limiter returns 429 when exceeded.
 */
export async function authorizeDesignPlatformRequest(
  deps: DesignPlatformAccessDeps = defaultDeps,
): Promise<DesignPlatformAccessResult> {
  const auth = await deps.requireUser();
  if (auth.response) {
    return {
      ok: false,
      user: null,
      supabase: auth.supabase,
      response: auth.response,
    };
  }

  const user = auth.user!;
  const rateLimited = await deps.enforceRateLimit(user.id);
  if (rateLimited) {
    return {
      ok: false,
      user,
      supabase: auth.supabase,
      response: rateLimited,
    };
  }

  return {
    ok: true,
    user,
    supabase: auth.supabase,
    response: null,
  };
}
