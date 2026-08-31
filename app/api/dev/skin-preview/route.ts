import { NextResponse } from "next/server";

import { readSkinPreviewHtml } from "@/lib/website/visual-skin/skin-preview-file";

export const dynamic = "force-dynamic";

/**
 * Dev-only HTML preview for visual skin templates.
 * GET /api/dev/skin-preview?skin=volt
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not available in production." }, { status: 404 });
  }

  const skin = new URL(request.url).searchParams.get("skin")?.trim();
  if (!skin) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing ?skin= query param. Example: /api/dev/skin-preview?skin=volt",
      },
      { status: 400 },
    );
  }

  const result = await readSkinPreviewHtml(skin);
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
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
