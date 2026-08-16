import { createClient } from "@/lib/supabase/server";
import { isWebsitePublishEnabled } from "@/lib/website/publish-config";
import {
  applyHtmlLangAttribute,
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

  const sanitized = sanitizePublicHtml(data.preview_html);
  // Preserve the language baked into preview_html at publish time — never
  // force "en" over Arabic/other generated sites.
  const langMatch = sanitized.match(/<html[^>]*\slang=["']([^"']+)["']/i);
  const lang = (langMatch?.[1] ?? "en").trim().toLowerCase().slice(0, 2) || "en";

  return new NextResponse(applyHtmlLangAttribute(sanitized, lang), {
    status: 200,
    headers: publicSiteResponseHeaders({ indexable: true }),
  });
}
