import { NextResponse } from "next/server";

import { requireUser } from "@/lib/api/helpers";
import { livePreviewResponseHeaders } from "@/lib/website/live-preview.server";
import { readSkinPreviewHtml } from "@/lib/website/visual-skin/skin-preview-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ skinId: string }> };

/**
 * Authenticated HTML preview for visual skin templates.
 * Same artifact as `npm run skin:preview` / `/api/dev/skin-preview`.
 * GET /api/website-builder/visual-skin/[skinId]/preview
 */
export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { skinId: raw } = await context.params;
  const skinId = decodeURIComponent(raw ?? "").trim();
  if (!skinId) {
    return NextResponse.json(
      { ok: false, error: "Missing skinId." },
      { status: 400 },
    );
  }

  const result = await readSkinPreviewHtml(skinId);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        skinId: result.skinId,
        code: result.code,
        message: result.message,
        filePath: result.filePath,
      },
      { status: result.code === "unknown_skin" ? 404 : 409 },
    );
  }

  return new NextResponse(result.html, {
    status: 200,
    headers: livePreviewResponseHeaders(),
  });
}
