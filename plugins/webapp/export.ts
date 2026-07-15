import { exportProjectAsZip } from "@/lib/ai/exporter";
import type { WebAppOutput } from "@/plugins/webapp/types";
import type { ExportResult, GenerationContext } from "@/lib/ai/types";

export async function exportWebApp(
  output: WebAppOutput,
  ctx: GenerationContext,
): Promise<ExportResult> {
  ctx.progress.emit("Building ZIP...");
  return exportProjectAsZip(output.files, `${output.title || "webapp"}.zip`);
}
