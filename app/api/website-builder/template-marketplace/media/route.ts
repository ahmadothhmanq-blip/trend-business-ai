import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiNotFoundError } from "@/lib/i18n/api-errors";
import {
  getWbTemplateRegistry,
  initializeWbTemplateEngine,
} from "@/lib/website/template-engine/index.server";
import type { InstalledTemplateMediaKind } from "@/lib/website/template-marketplace/media-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getContentType(filePath: string): string {
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

function parseMediaKind(value: string | null): InstalledTemplateMediaKind | null {
  if (value === "thumbnail" || value === "preview") return value;
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId")?.trim();
  const kind = parseMediaKind(searchParams.get("kind")?.trim() ?? null);

  if (!templateId || !kind) {
    return NextResponse.json(
      { ok: false, message: "templateId and kind are required" },
      { status: 400 },
    );
  }

  await initializeWbTemplateEngine();
  const pkg = getWbTemplateRegistry().getPackage(templateId);
  if (!pkg) {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Template not found.");
  }

  const filePath = pkg.mediaPaths[kind];

  try {
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        "Content-Type": getContentType(filePath),
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Media not found.");
  }
}
