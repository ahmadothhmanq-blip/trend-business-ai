/**
 * GCRI persistence — cookie/header/payload.
 * Independent from platform UI locale (`tba_locale`) and GLS language cookie.
 */

import {
  defaultGcriCountryForLanguage,
  getGcriCountriesForLanguage,
  resolveGcriCountry,
  resolveGcriProfile,
} from "@/lib/language-platform/gcri/resolve";
import type { GcriProfile } from "@/lib/language-platform/gcri/types";

export const GCRI_COUNTRY_COOKIE = "tba_generation_country";
export const GCRI_COUNTRY_STORAGE_KEY = "tba_generation_country";
export const GCRI_COUNTRY_HEADER = "x-tba-generation-country";

const COOKIE_MAX_AGE_SECONDS = 31_536_000;

export function parseGcriCountryCookie(cookieHeader?: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${GCRI_COUNTRY_COOKIE}=([^;]+)`),
  );
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function persistGcriCountry(countryCode: string): void {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;

  try {
    localStorage.setItem(GCRI_COUNTRY_STORAGE_KEY, code);
  } catch {
    /* ignore */
  }

  document.cookie = `${GCRI_COUNTRY_COOKIE}=${encodeURIComponent(code)};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};samesite=lax`;
}

export function readPersistedGcriCountry(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(GCRI_COUNTRY_STORAGE_KEY);
    if (stored && /^[A-Z]{2}$/i.test(stored)) return stored.toUpperCase();
  } catch {
    /* ignore */
  }
  if (typeof document === "undefined") return null;
  const fromCookie = parseGcriCountryCookie(document.cookie);
  return fromCookie ? fromCookie.toUpperCase() : null;
}

export function getInitialGcriCountry(language?: string | null): string {
  const persisted = readPersistedGcriCountry();
  const allowed = new Set(
    getGcriCountriesForLanguage(language).map((row) => row.countryCode),
  );
  if (persisted && allowed.has(persisted)) return persisted;
  return defaultGcriCountryForLanguage(language);
}

export function resolveRequestGcri(input: {
  language?: string | null;
  country?: string | null;
  header?: string | null;
  cookie?: string | null;
}): GcriProfile {
  const country = resolveGcriCountry({
    language: input.language,
    country: input.country,
    header: input.header,
    cookie: input.cookie,
  });
  return resolveGcriProfile({ language: input.language, country });
}

export function gcriPayload(
  language?: string | null,
  country?: string | null,
): { country: string } {
  const profile = resolveGcriProfile({ language, country });
  return { country: profile.countryCode };
}
