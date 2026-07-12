import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/api/helpers";
import { verifyPreviewOwner } from "@/lib/api/preview-ownership";
import { NextResponse } from "next/server";

const GENERATED_ROOT = path.join(process.cwd(), ".next", "generated-projects");

export const runtime = "nodejs";

function sanitizePreviewId(id: string) {
  if (!/^[a-f0-9-]{36}$/i.test(id)) {
    throw new Error("Invalid preview id.");
  }

  return id;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const previewId = sanitizePreviewId(id);

    const isOwner = await verifyPreviewOwner(previewId, auth.user!.id);
    if (!isOwner) {
      return NextResponse.json({ error: "Preview not found." }, { status: 404 });
    }

    const exportedHtml = await readFile(
      path.join(GENERATED_ROOT, previewId, "out", "index.html"),
      "utf8",
    );

    return new NextResponse(exportedHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src data: https:; style-src 'self' 'unsafe-inline'; font-src data:; frame-ancestors 'self';",
      },
    });
  } catch {
    return NextResponse.json({ error: "Preview not found." }, { status: 404 });
  }
}
