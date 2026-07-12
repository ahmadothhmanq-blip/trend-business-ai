import { exportProjectAsZip } from "@/lib/ai/exporter";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { ExportResult, GenerationContext } from "@/lib/ai/types";

export async function exportWebsite(
  output: GeneratedWebsiteProject,
  ctx: GenerationContext,
): Promise<ExportResult> {
  ctx.progress.emit("Building ZIP...");
  return exportProjectAsZip(output.files, `${output.title || "project"}.zip`);
}
