import type { ExportResult, GeneratedProjectFile } from "@/lib/ai/types";
import { buildProjectZip } from "@/lib/ai/zipper";

export async function exportProjectAsZip(
  files: GeneratedProjectFile[],
  filename = "project.zip",
): Promise<ExportResult> {
  const data = await buildProjectZip(files);

  return {
    format: "zip",
    data,
    filename,
  };
}

export function exportProjectAsJson<T extends Record<string, unknown>>(
  payload: T,
  filename = "project.json",
): ExportResult {
  return {
    format: "json",
    data: payload,
    filename,
  };
}

export function exportProjectAsMarkdown(
  content: string,
  filename = "output.md",
): ExportResult {
  return {
    format: "markdown",
    data: content,
    filename,
  };
}
