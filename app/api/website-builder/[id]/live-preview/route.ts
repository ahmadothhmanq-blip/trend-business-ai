import { requireUser, parseUuidParam } from "@/lib/api/helpers";
import { apiNotFoundError } from "@/lib/i18n/api-errors";
import {
  livePreviewResponseHeaders,
  resolveLivePreviewHtml,
} from "@/lib/website/live-preview";
import { requireWebsiteGenerationAccess } from "@/lib/website/builder/route-access";
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

  const accessResult = await requireWebsiteGenerationAccess(
    auth.supabase,
    auth.user!.id,
    id,
    "view",
  );
  if (accessResult instanceof NextResponse) return accessResult;

  const html = resolveLivePreviewHtml(accessResult.generation);
  return new NextResponse(html, {
    status: 200,
    headers: livePreviewResponseHeaders(),
  });
}
