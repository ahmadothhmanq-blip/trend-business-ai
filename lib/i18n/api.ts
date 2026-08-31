import { LOCALE_COOKIE, LOCALE_HEADER } from "@/lib/i18n/config";
import {
  GLS_GENERATION_LANGUAGE_HEADER,
  parseGlsGenerationLanguageCookie,
  resolveGlsGenerationLanguage,
} from "@/lib/language-platform/generation/service";
import { bindGcriContext } from "@/lib/language-platform/gcri/context.server";
import {
  GCRI_COUNTRY_HEADER,
  parseGcriCountryCookie,
  resolveRequestGcri,
} from "@/lib/language-platform/gcri/service";

export function getRequestLocale(request: Request): string | null {
  return (
    request.headers.get(LOCALE_HEADER) ||
    parseCookieLocale(request.headers.get("cookie"))
  );
}

function parseCookieLocale(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Unified GLS pipeline for every AI request.
 * Prefers explicit body language, then persisted generation language,
 * then the previous UI-locale fallback so older clients keep working.
 */
export function getRequestAiLanguage(
  request: Request,
  explicitLanguage?: string | null,
  explicitCountry?: string | null,
): string {
  const language = resolveGlsGenerationLanguage({
    explicit: explicitLanguage,
    header: request.headers.get(GLS_GENERATION_LANGUAGE_HEADER),
    cookie: parseGlsGenerationLanguageCookie(request.headers.get("cookie")),
    uiLocale: getRequestLocale(request),
  });

  const gcri = resolveRequestGcri({
    language,
    country: explicitCountry,
    header: request.headers.get(GCRI_COUNTRY_HEADER),
    cookie: parseGcriCountryCookie(request.headers.get("cookie")),
  });
  bindGcriContext(gcri);

  return language;
}

/**
 * Resolve AI output language for any generation API.
 * Same pipeline as `getRequestAiLanguage`.
 */
export function resolveRequestLanguage(
  request: Request,
  explicitLanguage?: string | null,
  explicitCountry?: string | null,
): string {
  return getRequestAiLanguage(request, explicitLanguage, explicitCountry);
}
