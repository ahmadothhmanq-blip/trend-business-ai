/**
 * Import website project ZIP — inverse of prepare-export.
 */

import JSZip from "jszip";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { sanitizeProjectPath } from "@/lib/ai/zipper";

export type WebsiteImportResult = {
  files: GeneratedProjectFile[];
  title: string;
  warnings: string[];
  ready: boolean;
  blockingIssues: string[];
};

const ESSENTIAL = ["app/page.tsx", "package.json"];

function languageForPath(path: string): GeneratedProjectFile["language"] {
  if (path.endsWith(".tsx") || path.endsWith(".jsx")) return "tsx";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".md")) return "markdown";
  return "plaintext";
}

export async function parseImportZip(
  bytes: ArrayBuffer | Uint8Array,
): Promise<GeneratedProjectFile[]> {
  const zip = await JSZip.loadAsync(bytes);
  const files: GeneratedProjectFile[] = [];

  for (const [rawPath, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const path = sanitizeProjectPath(rawPath);
    if (!path || path.includes("..")) continue;
    const content = await entry.async("string");
    files.push({ path, content, language: languageForPath(path) });
  }

  return files;
}

export function validateImportFiles(files: GeneratedProjectFile[]): {
  ready: boolean;
  blockingIssues: string[];
  warnings: string[];
} {
  const blocking: string[] = [];
  const warnings: string[] = [];
  const paths = new Set(files.map((f) => f.path));

  for (const essential of ESSENTIAL) {
    if (!paths.has(essential)) {
      blocking.push(`Missing essential file: ${essential}`);
    }
  }

  if (!files.some((f) => f.path.startsWith("app/"))) {
    blocking.push("ZIP must contain at least one app/ route file");
  }

  const oversized = files.filter((f) => f.content.length > 2_000_000);
  if (oversized.length) {
    warnings.push(`${oversized.length} file(s) exceed 2MB — may slow preview`);
  }

  return { ready: blocking.length === 0, blockingIssues: blocking, warnings };
}

export async function importWebsiteProjectFromZip(
  bytes: ArrayBuffer | Uint8Array,
  titleHint?: string,
): Promise<WebsiteImportResult> {
  const files = await parseImportZip(bytes);
  const validation = validateImportFiles(files);
  const pkg = files.find((f) => f.path === "package.json");
  let title = titleHint || "Imported Website";
  if (!titleHint && pkg) {
    try {
      const parsed = JSON.parse(pkg.content) as { name?: string };
      if (parsed.name) {
        title = parsed.name.replace(/-/g, " ");
      }
    } catch {
      // keep default title
    }
  }

  return {
    files,
    title: String(title),
    warnings: validation.warnings,
    ready: validation.ready,
    blockingIssues: validation.blockingIssues,
  };
}
