import { NextResponse, NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { resolveHostToSlug } from "@/lib/ai-core/domains/resolve";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  detectLocaleFromAcceptLanguage,
  normalizeLocale,
} from "@/lib/i18n/config";
import {
  isApiOrInternalPath,
  shouldAutoRedirectForLocale,
  stripLocaleFromPathname,
} from "@/lib/i18n/paths";

type LocaleRoutingResult = {
  locale: string;
  rewriteUrl?: URL;
  redirectUrl?: URL;
};

function resolveLocaleRouting(request: NextRequest): LocaleRoutingResult | null {
  const { pathname } = request.nextUrl;
  if (isApiOrInternalPath(pathname)) return null;

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const { locale: prefixLocale, pathname: strippedPath } =
    stripLocaleFromPathname(pathname);

  if (prefixLocale) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = strippedPath;
    return { locale: prefixLocale, rewriteUrl };
  }

  const resolved = normalizeLocale(cookieLocale);
  if (cookieLocale) {
    return { locale: resolved };
  }

  const detected = detectLocaleFromAcceptLanguage(
    request.headers.get("accept-language"),
  );

  if (
    detected !== DEFAULT_LOCALE &&
    shouldAutoRedirectForLocale(pathname)
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      pathname === "/"
        ? `/${detected}`
        : `/${detected}${pathname}`;
    return { locale: detected, redirectUrl };
  }

  return { locale: detected };
}

function applyLocaleToResponse(
  response: NextResponse,
  locale: string,
): NextResponse {
  response.headers.set(LOCALE_HEADER, locale);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

/**
 * Session + locale routing + optional custom-domain host rewrite → /w/{slug}.
 * Does not alter platform hosts or existing publish routes.
 */
export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const resolution = await resolveHostToSlug(host);

  if (resolution?.slug) {
    const url = request.nextUrl.clone();
    const path = url.pathname === "/" ? "" : url.pathname;
    if (
      path === "" ||
      path === "/" ||
      path === "/robots.txt" ||
      path === "/sitemap.xml"
    ) {
      url.pathname =
        path === "/robots.txt"
          ? `/w/${resolution.slug}/robots.txt`
          : path === "/sitemap.xml"
            ? `/w/${resolution.slug}/sitemap.xml`
            : `/w/${resolution.slug}`;
      return NextResponse.rewrite(url);
    }
  }

  const localeRouting = resolveLocaleRouting(request);

  if (localeRouting?.redirectUrl) {
    const redirect = NextResponse.redirect(localeRouting.redirectUrl);
    return applyLocaleToResponse(redirect, localeRouting.locale);
  }

  const requestHeaders = new Headers(request.headers);
  if (localeRouting) {
    requestHeaders.set(LOCALE_HEADER, localeRouting.locale);
  }

  const sessionRequest = new NextRequest(request.url, {
    headers: requestHeaders,
    method: request.method,
  });

  const sessionResponse = await updateSession(sessionRequest, {
    rewriteUrl: localeRouting?.rewriteUrl,
  });

  if (localeRouting) {
    return applyLocaleToResponse(sessionResponse, localeRouting.locale);
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
