import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";
import { stripLocaleFromPathname } from "@/lib/i18n/paths";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://api.deepseek.com https://*.openai.com https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';",
};

/** Routes served inside dashboard iframes (D-017 static live preview + skin catalog). */
function isEmbeddablePreviewPath(pathname: string): boolean {
  return (
    /^\/api\/website-builder\/[^/]+\/live-preview\/?$/.test(pathname) ||
    /^\/api\/webapp-builder\/[^/]+\/live-preview\/?$/.test(pathname) ||
    pathname.startsWith("/api/website-builder/preview/") ||
    /^\/api\/website-builder\/visual-skin\/[^/]+\/preview\/?$/.test(pathname) ||
    pathname.startsWith("/api/dev/skin-preview")
  );
}

function applySecurityHeaders(
  response: NextResponse,
  pathname?: string,
): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    // Let live-preview / compile-preview routes set their own framing CSP.
    if (
      pathname &&
      isEmbeddablePreviewPath(pathname) &&
      (key === "X-Frame-Options" || key === "Content-Security-Policy")
    ) {
      continue;
    }
    response.headers.set(key, value);
  }
  return response;
}

type UpdateSessionOptions = {
  /** Internal rewrite target when serving locale-prefixed public URLs. */
  rewriteUrl?: URL;
};

export async function updateSession(
  request: NextRequest,
  options?: UpdateSessionOptions,
) {
  const buildResponse = () =>
    options?.rewriteUrl
      ? NextResponse.rewrite(options.rewriteUrl)
      : NextResponse.next({ request });

  let supabaseResponse = buildResponse();
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = buildResponse();
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
            supabaseResponse.cookies.set(name, value, cookieOptions),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname: routePath } = stripLocaleFromPathname(
    request.nextUrl.pathname,
  );

  const isAuthRoute =
    routePath.startsWith("/login") ||
    routePath.startsWith("/signup") ||
    routePath.startsWith("/forgot-password");
  const isProtectedRoute = routePath.startsWith("/dashboard");

  const pathname = routePath;

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", routePath);
    return applySecurityHeaders(NextResponse.redirect(redirectUrl), pathname);
  }

  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return applySecurityHeaders(NextResponse.redirect(redirectUrl), pathname);
  }

  return applySecurityHeaders(supabaseResponse, pathname);
}
