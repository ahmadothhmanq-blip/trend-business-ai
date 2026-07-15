import JSZip from "jszip";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { sanitizeProjectPath } from "@/lib/ai/sanitize-path";

export { sanitizeProjectPath } from "@/lib/ai/sanitize-path";

export async function buildProjectZip(files: GeneratedProjectFile[]) {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(sanitizeProjectPath(file.path), file.content);
  }

  return zip.generateAsync({ type: "uint8array" });
}
