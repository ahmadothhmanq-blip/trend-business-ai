import { exportProjectAsZip } from "@/lib/ai/exporter";
import type { LPOutput } from "@/plugins/landing-page/types";
import type { ExportResult, GenerationContext } from "@/lib/ai/types";

export async function exportLandingPage(
  output: LPOutput,
  ctx: GenerationContext,
): Promise<ExportResult> {
  ctx.progress.emit("Building ZIP...");
  return exportProjectAsZip(output.files, `${output.title || "landing-page"}.zip`);
}
