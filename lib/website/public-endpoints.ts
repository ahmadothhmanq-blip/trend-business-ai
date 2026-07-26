/**
 * Shared helpers for public Website Builder endpoints (leads, analytics).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import { API_ERROR_CODES, apiErrorResponse } from "@/lib/i18n/api-errors";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getRequestClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "anon"
  );
}

export function isWebsiteGenerationUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Rate limit public website endpoints per IP.
 * Uses Upstash when configured; otherwise in-memory per instance.
 */
export type WebsitePublicRateLimitScope =
  | "leads"
  | "track"
  | "marketplace"
  | "design-platform"
  | "template-intelligence";

export async function enforceWebsitePublicRateLimit(
  scope: WebsitePublicRateLimitScope,
  ip: string,
): Promise<NextResponse | null> {
  const rateLimited = await enforceMutationRateLimitAsync(`wb-${scope}:${ip}`);
  if (!rateLimited) return null;
  if (rateLimited.status >= 500) {
    console.error(
      `website ${scope} rate limit unavailable`,
      await rateLimited.clone().json().catch(() => null),
    );
    if (process.env.NODE_ENV === "production") {
      return apiErrorResponse(
        API_ERROR_CODES.SERVER_ERROR,
        503,
        "Rate limiting temporarily unavailable. Please try again shortly.",
      );
    }
    return null;
  }
  return rateLimited;
}

/** Rate limit authenticated Website Builder mutations per user. */
export async function enforceWebsiteUserMutationRateLimit(
  userId: string,
): Promise<NextResponse | null> {
  const rateLimited = await enforceMutationRateLimitAsync(`wb-mutation:${userId}`);
  if (!rateLimited) return null;
  if (rateLimited.status >= 500) {
    console.error(
      "website mutation rate limit unavailable",
      await rateLimited.clone().json().catch(() => null),
    );
    if (process.env.NODE_ENV === "production") {
      return apiErrorResponse(
        API_ERROR_CODES.SERVER_ERROR,
        503,
        "Rate limiting temporarily unavailable. Please try again shortly.",
      );
    }
    return null;
  }
  return rateLimited;
}

export async function verifyOptionalCaptchaToken(
  token: string | undefined | null,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret =
    process.env.TURNSTILE_SECRET_KEY?.trim() ||
    process.env.CLOUDFLARE_TURNSTILE_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, reason: "Captcha verification is required." };
    }
    return { ok: true };
  }
  if (!token?.trim()) {
    return { ok: false, reason: "Captcha verification required." };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token.trim(),
        }),
      },
    );
    const data = (await response.json()) as { success?: boolean };
    if (!data.success) {
      return { ok: false, reason: "Captcha verification failed." };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Captcha verification unavailable." };
  }
}

export async function isPublishedWebsiteGeneration(
  client: SupabaseClient,
  generationId: string,
): Promise<boolean> {
  if (!isWebsiteGenerationUuid(generationId)) return false;

  const { data: generation, error: generationError } = await client
    .from("website_generations")
    .select("id")
    .eq("id", generationId)
    .maybeSingle();
  if (generationError || !generation) return false;

  const { data: publication, error: publicationError } = await client
    .from("website_publications")
    .select("generation_id")
    .eq("generation_id", generationId)
    .eq("status", "published")
    .maybeSingle();
  if (publicationError || !publication) return false;

  return true;
}
