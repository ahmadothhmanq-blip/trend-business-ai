import { createClient } from "@/lib/supabase/server";
import { isWebAppPublicPublishEnabled } from "@/lib/ai-core/app-design-platform/deploy";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

function publicAppHeaders() {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=60, s-maxage=300",
    "Content-Security-Policy":
      "default-src 'none'; style-src 'unsafe-inline'; img-src data: https: blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

/**
 * Public hosted App Builder URL — static HTML sandbox (not a Node Next.js host).
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug: rawSlug } = await context.params;
  const slug = rawSlug?.trim().toLowerCase();

  if (!slug || !/^[a-z0-9-]{2,80}$/.test(slug)) {
    return NextResponse.json({ error: "Invalid app slug." }, { status: 400 });
  }

  if (!isWebAppPublicPublishEnabled()) {
    return NextResponse.json(
      {
        error: "Public app hosting is disabled.",
        hint: "Unset WEBAPP_PUBLISH_ENABLED or set it to true.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("webapp_publications")
    .select("status, preview_html, title")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data?.preview_html) {
    return NextResponse.json({ error: "Published app not found." }, { status: 404 });
  }

  return new NextResponse(data.preview_html, {
    status: 200,
    headers: publicAppHeaders(),
  });
}
