import { createClient } from "@/lib/supabase/server";
import { buildPlannedPublicUrl, isWebsitePublishEnabled } from "@/lib/website/publish";
import { buildPublicSitemapXml } from "@/lib/website/public-site";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Per-site sitemap.xml for published Website Builder sites.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug: rawSlug } = await context.params;
  const slug = rawSlug?.trim().toLowerCase();

  if (!slug || !/^[a-z0-9-]{2,64}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid site slug." }, { status: 400 });
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
    .select("status, sitemap_xml, seo_json, planned_public_url, public_path")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Published website not found." }, { status: 404 });
  }

  const publicUrl =
    data.planned_public_url ||
    buildPlannedPublicUrl(slug).plannedPublicUrl ||
    `/w/${slug}`;
  const absolute =
    publicUrl.startsWith("http")
      ? publicUrl
      : `https://example.com${publicUrl}`;

  const body =
    (typeof data.sitemap_xml === "string" && data.sitemap_xml.trim()) ||
    buildPublicSitemapXml({
      publicUrl: absolute,
      seoPackage: (data.seo_json as CoreSeoPackage | null) ?? null,
    });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
