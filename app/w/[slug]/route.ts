import { createClient } from "@/lib/supabase/server";
import { isWebsitePublishEnabled } from "@/lib/website/publish";
import { sanitizePreviewHtml } from "@/lib/website/build-static-preview";
import { livePreviewResponseHeaders } from "@/lib/website/live-preview";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Public hosted URL endpoint (architecture ready).
 * Serves only when WEBSITE_PUBLISH_ENABLED=true and publication status is published.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug: rawSlug } = await context.params;
  const slug = rawSlug?.trim().toLowerCase();

  if (!slug || !/^[a-z0-9-]{2,64}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid site slug." }, { status: 400 });
  }

  if (!isWebsitePublishEnabled()) {
    return NextResponse.json(
      {
        error: "Public website hosting is prepared but not enabled yet.",
        architecture: {
          route: "/w/[slug]",
          gate: "WEBSITE_PUBLISH_ENABLED",
          delivery: "static-html-sandbox",
        },
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_publications")
    .select("status, preview_html, title, planned_public_url")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data?.preview_html) {
    return NextResponse.json({ error: "Published website not found." }, { status: 404 });
  }

  return new NextResponse(sanitizePreviewHtml(data.preview_html), {
    status: 200,
    headers: {
      ...livePreviewResponseHeaders(),
      "Cache-Control": "public, max-age=60",
      "X-Robots-Tag": "noindex",
    },
  });
}
