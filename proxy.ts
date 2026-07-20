import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { resolveHostToSlug } from "@/lib/ai-core/domains/resolve";

/**
 * Session + optional custom-domain host rewrite → /w/{slug}.
 * Does not alter platform hosts or existing publish routes.
 */
export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const resolution = await resolveHostToSlug(host);

  if (resolution?.slug) {
    const url = request.nextUrl.clone();
    const path = url.pathname === "/" ? "" : url.pathname;
    // Keep robots/sitemap under /w/{slug}/...
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

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
