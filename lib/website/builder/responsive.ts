/**
 * Website Builder — responsive design foundation (Phase 2).
 */

import type { VisualViewport } from "@/lib/ai-core/visual-editor/types";

export type BuilderBreakpoint = {
  id: VisualViewport;
  label: string;
  width: string;
  minWidth: number;
};

export const BUILDER_BREAKPOINTS: BuilderBreakpoint[] = [
  { id: "desktop", label: "Desktop", width: "100%", minWidth: 1024 },
  { id: "tablet", label: "Tablet", width: "768px", minWidth: 768 },
  { id: "mobile", label: "Mobile", width: "390px", minWidth: 0 },
];

export function getBuilderBreakpoint(id: VisualViewport): BuilderBreakpoint {
  return (
    BUILDER_BREAKPOINTS.find((bp) => bp.id === id) ?? BUILDER_BREAKPOINTS[0]!
  );
}
