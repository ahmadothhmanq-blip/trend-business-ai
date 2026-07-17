import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import {
  livePreviewResponseHeaders,
  resolveLivePreviewHtml,
} from "@/lib/website/live-preview";
import type { WebsiteGeneration } from "@/types/database";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Safe in-platform live preview (D-017).
 * Serves sanitized static HTML from the saved blueprint — no npm install / Next build.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const idParsed = parseUuidParam(rawId);
  if (idParsed instanceof NextResponse) return idParsed;
  const { id } = idParsed;

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { data, error } = await auth.supabase
    .from("website_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user!.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const html = resolveLivePreviewHtml(data as WebsiteGeneration);
  return new NextResponse(html, {
    status: 200,
    headers: livePreviewResponseHeaders(),
  });
}
