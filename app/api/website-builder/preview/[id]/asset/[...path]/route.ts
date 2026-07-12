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

function sanitizeAssetPath(parts: string[]) {
  const normalized = parts.join("/").replaceAll("\\", "/").replace(/^\/+/, "");

  if (
    !normalized ||
    normalized.includes("..") ||
    path.isAbsolute(normalized)
  ) {
    throw new Error("Invalid asset path.");
  }

  return normalized;
}

function resolveAssetPath(previewId: string, assetPath: string) {
  const outDir = path.resolve(GENERATED_ROOT, previewId, "out");
  const filePath = path.resolve(outDir, assetPath);

  if (!filePath.startsWith(`${outDir}${path.sep}`)) {
    throw new Error("Invalid asset path.");
  }

  return filePath;
}

function getContentType(filePath: string) {
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".woff")) return "font/woff";
  if (filePath.endsWith(".woff2")) return "font/woff2";
  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; path: string[] }> },
) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const { id, path: assetPathParts } = await params;
    const previewId = sanitizePreviewId(id);

    const isOwner = await verifyPreviewOwner(previewId, auth.user!.id);
    if (!isOwner) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    const assetPath = sanitizeAssetPath(assetPathParts);
    const filePath = resolveAssetPath(previewId, assetPath);
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": getContentType(filePath),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }
}
