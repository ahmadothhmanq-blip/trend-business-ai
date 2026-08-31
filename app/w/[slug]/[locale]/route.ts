import { createClient } from "@/lib/supabase/server";
import { isWebsitePublishEnabled } from "@/lib/website/publish-config";
import {
  applyHtmlDirAttribute,
  applyHtmlLangAttribute,
  publicSiteResponseHeaders,
  sanitizePublicHtml,
} from "@/lib/website/public-site";
import { extractVisitorLocaleHtml } from "@/lib/website/published-seo";
import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string; locale: string }> };

/**
 * Locale variant for published sites — /w/{slug}/{locale}
 * Serves locale-specific HTML stored at publish time.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug: rawSlug, locale: rawLocale } = await context.params;
  const slug = rawSlug?.trim().toLowerCase();
  const locale = rawLocale?.trim().toLowerCase();

  if (!slug || !/^[a-z0-9-]{2,64}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid site slug." }, { status: 400 });
  }
  if (!locale || !/^[a-z]{2}$/.test(locale)) {
    return NextResponse.json({ error: "Invalid locale code." }, { status: 400 });
  }

  if (!isWebsitePublishEnabled()) {
    return NextResponse.json(
      { error: "Public website hosting is disabled." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_publications")
    .select("status, preview_html, seo_json")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data?.preview_html) {
    return NextResponse.json({ error: "Published website not found." }, { status: 404 });
  }

  const localeHtml = extractVisitorLocaleHtml(data.seo_json)?.[locale];
  let html = localeHtml ?? data.preview_html;

  const localeMeta = resolveLocaleFromLanguage(locale);
  html = applyHtmlLangAttribute(sanitizePublicHtml(html), locale);
  html = applyHtmlDirAttribute(html, localeMeta.dir);

  return new NextResponse(html, {
    status: 200,
    headers: publicSiteResponseHeaders({ indexable: true }),
  });
}
