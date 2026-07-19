/**
 * Declared extension capabilities for the Visual Website Editor.
 * Marketplace / A/B / analytics can register here without rewriting the canvas.
 */

import type { VisualEditorCapability } from "@/lib/ai-core/visual-editor/types";

export const VISUAL_EDITOR_CAPABILITIES: VisualEditorCapability[] = [
  {
    id: "ai-commands",
    label: "AI editing commands",
    slot: "ai-commands",
    enabled: true,
  },
  {
    id: "component-marketplace",
    label: "Component marketplace",
    slot: "component-marketplace",
    enabled: true,
  },
  {
    id: "templates",
    label: "Template swap",
    slot: "templates",
    enabled: true,
  },
  {
    id: "ab-testing",
    label: "A/B testing",
    slot: "ab-testing",
    enabled: true,
  },
  {
    id: "analytics",
    label: "Analytics overlays",
    slot: "analytics",
    enabled: true,
  },
];
