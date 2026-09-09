import { exportProjectAsZip } from "@/lib/ai/exporter";
import { mergeMobileStoreIntoProjectFiles } from "@/lib/ai/webapp-mobile-store";
import type { WebAppOutput } from "@/plugins/webapp/types";
import type { ExportResult, GenerationContext } from "@/lib/ai/types";

export async function exportWebApp(
  output: WebAppOutput,
  ctx: GenerationContext,
): Promise<ExportResult> {
  ctx.progress.emit("Building ZIP...");
  const files = mergeMobileStoreIntoProjectFiles(output.files, {
    title: output.title || "webapp",
    primaryColor: output.appModel?.brand?.tokens?.primary,
  });
  return exportProjectAsZip(files, `${output.title || "webapp"}.zip`);
}
