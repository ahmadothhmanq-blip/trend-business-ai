/**
 * Unified Generation Language System (GLS) service.
 *
 * Single source for available languages, validation, persistence, API payload,
 * and default resolution. Independent from platform UI locale (`tba_locale`).
 */

import { resolveAiLanguage } from "@/lib/i18n/ai-language";
import type { GlsServiceId } from "@/lib/language-platform/core/types";
import { GLS_SERVICE_REGISTRY } from "@/lib/language-platform/registry/services";
import {
  getGlsGenerationLanguageOptions,
  getGlsGenerationLanguageValues,
  isGlsGenerationLanguage,
  normalizeGlsGenerationLanguage,
  PRIMARY_SITE_LANGUAGE,
  type GlsGenerationLanguageOption,
  type GlsGenerationLanguageValue,
} from "@/lib/language-platform/generation/options";
import { resolveGcriProfile } from "@/lib/language-platform/gcri/resolve";
import { readPersistedGcriCountry } from "@/lib/language-platform/gcri/service";

/** Cookie / storage — must never collide with platform UI locale `tba_locale`. */
export const GLS_GENERATION_LANGUAGE_COOKIE = "tba_generation_language";
export const GLS_GENERATION_LANGUAGE_STORAGE_KEY = "tba_generation_language";
export const GLS_GENERATION_LANGUAGE_HEADER = "x-tba-generation-language";

const COOKIE_MAX_AGE_SECONDS = 31_536_000;

const WORKSPACE_TYPE_TO_SERVICE: Record<string, GlsServiceId> = {
  marketing: "marketing-ai",
  manager: "business-manager",
  social: "social-media",
  brand: "brand-designer",
  content: "content-studio",
  creative: "content-studio",
  business: "content-studio",
  audit: "content-studio",
};

function takeValidGenerationLanguage(
  value?: string | null,
): GlsGenerationLanguageValue | null {
  const raw = value?.trim();
  if (!raw || !isGlsGenerationLanguage(raw)) return null;
  return normalizeGlsGenerationLanguage(raw);
}

export function isGlsServiceId(value?: string | null): value is GlsServiceId {
  if (!value) return false;
  return GLS_SERVICE_REGISTRY.some((service) => service.id === value);
}

/** Unknown / future products fall back to the world-language list (no Bilingual). */
export function resolveGlsServiceId(value?: string | null): GlsServiceId {
  return isGlsServiceId(value) ? value : "content-studio";
}

export function glsServiceIdForWorkspaceType(type?: string | null): GlsServiceId {
  if (!type) return "content-studio";
  return WORKSPACE_TYPE_TO_SERVICE[type] ?? "content-studio";
}

export function getGlsAvailableGenerationLanguages(
  serviceId?: string | null,
): readonly GlsGenerationLanguageValue[] {
  return getGlsGenerationLanguageValues(resolveGlsServiceId(serviceId));
}

export function getGlsAvailableGenerationLanguageOptions(
  serviceId?: string | null,
): readonly GlsGenerationLanguageOption[] {
  return getGlsGenerationLanguageOptions(resolveGlsServiceId(serviceId));
}

export function validateGlsGenerationLanguage(value?: string | null): boolean {
  return isGlsGenerationLanguage(value);
}

export function getDefaultGlsGenerationLanguage(
  serviceId?: string | null,
): GlsGenerationLanguageValue {
  const resolved = resolveGlsServiceId(serviceId);
  const definition = GLS_SERVICE_REGISTRY.find((service) => service.id === resolved);
  return normalizeGlsGenerationLanguage(
    definition?.defaultLanguage ?? PRIMARY_SITE_LANGUAGE,
  );
}

/**
 * Resolve order (independent of UI locale unless nothing else is stored):
 * 1. Explicit request/body language
 * 2. Persisted GLS preference (header, then cookie)
 * 3. UI locale — current behavior for products that mirrored the dashboard language
 * 4. Canonical default (English)
 */
export function resolveGlsGenerationLanguage(input: {
  explicit?: string | null;
  header?: string | null;
  cookie?: string | null;
  persisted?: string | null;
  uiLocale?: string | null;
}): GlsGenerationLanguageValue {
  if (input.explicit?.trim()) {
    return normalizeGlsGenerationLanguage(
      resolveAiLanguage({ language: input.explicit }),
    );
  }

  const header = takeValidGenerationLanguage(input.header);
  if (header) return header;

  const cookie = takeValidGenerationLanguage(input.cookie);
  if (cookie) return cookie;

  const persisted = takeValidGenerationLanguage(input.persisted);
  if (persisted) return persisted;

  if (input.uiLocale?.trim()) {
    return normalizeGlsGenerationLanguage(
      resolveAiLanguage({ locale: input.uiLocale }),
    );
  }

  return PRIMARY_SITE_LANGUAGE;
}

export function parseGlsGenerationLanguageCookie(
  cookieHeader?: string | null,
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${GLS_GENERATION_LANGUAGE_COOKIE}=([^;]+)`),
  );
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function persistGlsGenerationLanguage(value: string): void {
  const normalized = normalizeGlsGenerationLanguage(value);
  if (typeof window === "undefined" || typeof document === "undefined") return;

  try {
    localStorage.setItem(GLS_GENERATION_LANGUAGE_STORAGE_KEY, normalized);
  } catch {
    /* ignore quota / private mode */
  }

  document.cookie = `${GLS_GENERATION_LANGUAGE_COOKIE}=${encodeURIComponent(normalized)};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};samesite=lax`;
}

export function readPersistedGlsGenerationLanguage(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(GLS_GENERATION_LANGUAGE_STORAGE_KEY);
    const fromStorage = takeValidGenerationLanguage(stored);
    if (fromStorage) return fromStorage;
  } catch {
    /* ignore */
  }

  if (typeof document === "undefined") return null;
  return takeValidGenerationLanguage(
    parseGlsGenerationLanguageCookie(document.cookie),
  );
}

/** Client default: stored project language → persisted GLS → product fallback. */
export function getInitialGlsGenerationLanguage(input?: {
  stored?: string | null;
  fallback?: "english" | "ui-locale";
  uiLocale?: string | null;
}): GlsGenerationLanguageValue {
  const stored = takeValidGenerationLanguage(input?.stored);
  if (stored) return stored;

  const persisted = readPersistedGlsGenerationLanguage();
  if (persisted) return persisted;

  if (input?.fallback === "ui-locale") {
    return resolveGlsGenerationLanguage({ uiLocale: input.uiLocale });
  }

  return PRIMARY_SITE_LANGUAGE;
}

export function generationLanguageFromStoredProject(
  stored?: string | null,
): GlsGenerationLanguageValue {
  if (stored && isGlsGenerationLanguage(stored)) {
    return normalizeGlsGenerationLanguage(stored);
  }
  return PRIMARY_SITE_LANGUAGE;
}

export function glsGenerationLanguagePayload(
  language?: string | null,
  country?: string | null,
): { language: GlsGenerationLanguageValue; country: string } {
  const normalized = normalizeGlsGenerationLanguage(language);
  return {
    language: normalized,
    country: resolveGcriProfile({
      language: normalized,
      country: country ?? readPersistedGcriCountry(),
    }).countryCode,
  };
}
