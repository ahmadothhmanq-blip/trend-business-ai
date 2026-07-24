import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/i18n/config";

const LOCALE_PREFIX_RE =
  /^\/(en|ar|es|fr|de|it|pt|nl|tr|zh-CN|zh-TW|ja|ko|ru|hi|id|vi|th|pl|sv|no|da|fi|el|cs|ro|uk|ms|bn|fa|ur)(?=\/|$)/;

export function stripLocaleFromPathname(pathname: string): {
  locale: SupportedLocale | null;
  pathname: string;
} {
  const match = pathname.match(LOCALE_PREFIX_RE);
  if (!match) {
    return { locale: null, pathname };
  }

  const locale = match[1]!;
  if (!isSupportedLocale(locale)) {
    return { locale: null, pathname };
  }

  const rest = pathname.slice(match[0].length) || "/";
  return {
    locale,
    pathname: rest.startsWith("/") ? rest : `/${rest}`,
  };
}

export function localizedPath(
  path: string,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) {
    return normalized;
  }
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}

export function switchLocaleInPath(
  pathname: string,
  nextLocale: SupportedLocale,
): string {
  const { pathname: stripped } = stripLocaleFromPathname(pathname);
  return localizedPath(stripped, nextLocale);
}

export function isApiOrInternalPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/w/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname)
  );
}

export function shouldAutoRedirectForLocale(pathname: string): boolean {
  if (isApiOrInternalPath(pathname)) return false;
  if (pathname.startsWith("/dashboard")) return false;
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return false;
  }
  return true;
}
