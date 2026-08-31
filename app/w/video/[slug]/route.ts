import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadPublicVideoPage } from "@/lib/ai-core/video-production-platform/publish/service";
import { publicVideoPageHeaders } from "@/lib/ai-core/video-production-platform/publish/html";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: Params) {
  const { slug: rawSlug } = await context.params;
  const slug = rawSlug?.trim().toLowerCase() || "";
  const origin = new URL(request.url).origin;
  const supabase = createAdminClient() || (await createClient());

  try {
    const page = await loadPublicVideoPage({ supabase, slug, origin });
    if (page.status !== 200) {
      return NextResponse.json({ error: page.message }, { status: page.status });
    }
    return new NextResponse(page.html, {
      status: 200,
      headers: publicVideoPageHeaders(),
    });
  } catch {
    return NextResponse.json({ error: "Published video not found." }, { status: 404 });
  }
}
