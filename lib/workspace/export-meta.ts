import type { WorkspaceOutput } from "@/lib/workspace/types";

/** Lightweight meta string for previews — kept separate from heavy export deps. */
export function formatGenerationMeta(output: WorkspaceOutput) {
  const parts: string[] = [];
  if (output.source) parts.push(String(output.source));
  if (output.tokenUsage?.totalTokens) {
    parts.push(`${output.tokenUsage.totalTokens} tokens`);
  }
  if (output.generationTimeMs) {
    parts.push(`${(output.generationTimeMs / 1000).toFixed(1)}s`);
  }
  return parts.join(" · ");
}
