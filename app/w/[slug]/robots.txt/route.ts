import { createClient } from "@/lib/supabase/server";
import { buildPlannedPublicUrl, isWebsitePublishEnabled } from "@/lib/website/publish";
import { buildPublicRobotsTxt } from "@/lib/website/public-site";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * Per-site robots.txt for published Website Builder sites.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug: rawSlug } = await context.params;
  const slug = rawSlug?.trim().toLowerCase();

  if (!slug || !/^[a-z0-9-]{2,64}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid site slug." }, { status: 400 });
  }

  if (!isWebsitePublishEnabled()) {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_publications")
    .select("status, robots_txt, planned_public_url, public_path")
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
  const body =
    (typeof data.robots_txt === "string" && data.robots_txt.trim()) ||
    buildPublicRobotsTxt(
      publicUrl.startsWith("http")
        ? publicUrl
        : `https://example.com${publicUrl}`,
    );

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
