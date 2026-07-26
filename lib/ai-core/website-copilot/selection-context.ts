/**
 * Enrich Copilot commands with visual-editor selection context (Phase 2).
 */

import type { CopilotSelectionContext } from "@/lib/ai-core/website-copilot/types";

export function enrichCommandWithSelection(
  command: string,
  selection?: CopilotSelectionContext | null,
): string {
  const trimmed = command.trim();
  if (!trimmed || !selection) return trimmed;

  const focus =
    selection.componentExportName ||
    selection.sectionKind ||
    selection.nodeLabel;
  if (!focus) return trimmed;

  if (trimmed.toLowerCase().includes(focus.toLowerCase())) {
    return trimmed;
  }

  return `${trimmed} (focus on ${focus})`;
}

export function formatSelectionBadge(
  selection?: CopilotSelectionContext | null,
): string | null {
  if (!selection) return null;
  const label =
    selection.componentExportName ||
    selection.nodeLabel ||
    selection.sectionKind;
  if (!label) return null;
  return label;
}
