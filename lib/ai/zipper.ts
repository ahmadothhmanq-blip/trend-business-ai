import JSZip from "jszip";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export function sanitizeProjectPath(filePath: string) {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);

  if (
    !parts.length ||
    parts.some((part) => part === "." || part === "..") ||
    normalized.startsWith("node_modules/") ||
    normalized.startsWith(".next/")
  ) {
    throw new Error(`Unsafe generated file path: ${filePath}`);
  }

  return parts.join("/");
}

export async function buildProjectZip(files: GeneratedProjectFile[]) {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(sanitizeProjectPath(file.path), file.content);
  }

  return zip.generateAsync({ type: "uint8array" });
}
