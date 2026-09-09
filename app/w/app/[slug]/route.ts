import { createClient } from "@/lib/supabase/server";
import { isWebAppPublicPublishEnabled } from "@/lib/ai-core/app-design-platform/deploy";
import {
  appPreviewSecurityHeaders,
  sanitizeAppPreviewHtml,
  sanitizeTrustedInteractivePreviewHtml,
} from "@/lib/webapp/sanitize-app-preview-html";
import { injectPublicAppDemoBanner } from "@/lib/webapp/public-demo-banner";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

function publicAppHeaders(interactive: boolean) {
  return appPreviewSecurityHeaders({
    cacheControl: "public, max-age=60, s-maxage=300",
    referrerPolicy: "strict-origin-when-cross-origin",
    frameOptions: "SAMEORIGIN",
    interactive,
  });
}

/**
 * Public hosted App Builder URL — interactive in-memory preview sandbox
 * (not a Node Next.js host / database).
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

  const interactive =
    data.preview_html.includes('data-preview-trusted="1"') &&
    data.preview_html.includes("__PREVIEW_RUNTIME__");
  const html = interactive
    ? sanitizeTrustedInteractivePreviewHtml(data.preview_html)
    : sanitizeAppPreviewHtml(data.preview_html);
  const withDemo = injectPublicAppDemoBanner(html, {
    title: typeof data.title === "string" ? data.title : null,
  });

  return new NextResponse(withDemo, {
    status: 200,
    headers: publicAppHeaders(interactive),
  });
}
