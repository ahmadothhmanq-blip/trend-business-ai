import { createClient } from "@/lib/supabase/server";
import { isWebsitePublishEnabled } from "@/lib/website/publish";
import {
  publicSiteResponseHeaders,
  sanitizePublicHtml,
} from "@/lib/website/public-site";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Public hosted website URL.
 * Serves production-ready static HTML with SEO metadata when published.
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
        error: "Public website hosting is disabled.",
        hint: "Unset WEBSITE_PUBLISH_ENABLED or set it to true.",
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

  return new NextResponse(sanitizePublicHtml(data.preview_html), {
    status: 200,
    headers: publicSiteResponseHeaders({ indexable: true }),
  });
}
