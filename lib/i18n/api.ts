import { LOCALE_COOKIE, LOCALE_HEADER } from "@/lib/i18n/config";
import { resolveAiLanguage } from "@/lib/i18n/ai-language";

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

export function getRequestAiLanguage(
  request: Request,
  explicitLanguage?: string | null,
): string {
  const locale = getRequestLocale(request);
  return resolveAiLanguage({ locale, language: explicitLanguage });
}

/**
 * Resolve AI output language for any generation API.
 * Prefers explicit body language, then UI locale cookie/header.
 */
export function resolveRequestLanguage(
  request: Request,
  explicitLanguage?: string | null,
): string {
  return getRequestAiLanguage(request, explicitLanguage);
}
