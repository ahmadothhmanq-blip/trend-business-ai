/**
 * Visual-editor selection context for App Copilot.
 */

import type { AppCopilotSelectionContext } from "@/lib/ai-core/app-copilot/types";

export function enrichAppCommandWithSelection(
  command: string,
  selection?: AppCopilotSelectionContext | null,
): string {
  const focus =
    selection?.componentType || selection?.nodeLabel || selection?.screenId;
  if (!focus || command.toLowerCase().includes(focus.toLowerCase())) {
    return command;
  }
  return `${command} (focus on ${focus})`;
}
