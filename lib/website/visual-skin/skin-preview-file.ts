import "server-only";

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getVisualSkin } from "@/lib/website/visual-skin/registry";
import { resolveVisualSkinV2PackageId } from "@/lib/website/visual-skin/theme-bridge";

export function resolveSkinPreviewPackageId(skinId: string): string | null {
  const skin = getVisualSkin(skinId);
  if (!skin) return null;
  return resolveVisualSkinV2PackageId(skin.id);
}

export function resolveSkinPreviewFilePath(skinId: string, root = process.cwd()): string | null {
  const packageId = resolveSkinPreviewPackageId(skinId);
  if (!packageId) return null;
  return path.join(root, "scripts", "benchmark-results", "skin-previews", `${packageId}-preview.html`);
}

export async function readSkinPreviewHtml(skinId: string): Promise<{
  ok: true;
  skinId: string;
  packageId: string;
  filePath: string;
  html: string;
} | {
  ok: false;
  skinId: string;
  code: "unknown_skin" | "missing_file";
  message: string;
  filePath?: string;
}> {
  const skin = getVisualSkin(skinId);
  if (!skin) {
    return {
      ok: false,
      skinId,
      code: "unknown_skin",
      message: `Unknown visual skin "${skinId}". Run: npm run skin:list`,
    };
  }

  const packageId = resolveVisualSkinV2PackageId(skin.id);
  if (!packageId) {
    return {
      ok: false,
      skinId: skin.id,
      code: "unknown_skin",
      message: `No V2 package mapped for skin "${skin.id}".`,
    };
  }

  const filePath = resolveSkinPreviewFilePath(skin.id)!;
  if (!existsSync(filePath)) {
    return {
      ok: false,
      skinId: skin.id,
      code: "missing_file",
      message: `Preview file not generated yet. Run: npm run skin:preview -- ${skin.id}`,
      filePath,
    };
  }

  const html = await readFile(filePath, "utf8");
  return { ok: true, skinId: skin.id, packageId, filePath, html };
}

export function buildSkinPreviewDevUrl(skinId: string, baseUrl: string): string | null {
  if (!getVisualSkin(skinId)) return null;
  const url = new URL("/api/dev/skin-preview", baseUrl);
  url.searchParams.set("skin", getVisualSkin(skinId)!.id);
  return url.toString();
}