/**
 * Visual Website Editor — document model + future extension slots.
 * Supports canvas DnD today; designed for marketplace, templates, A/B, analytics, AI commands.
 */

import type { WebsiteEditAction } from "@/lib/ai-core/website-editor/types";

/** Future product surfaces that can plug into the visual editor. */
export type VisualEditorExtensionSlot =
  | "component-marketplace"
  | "templates"
  | "ab-testing"
  | "analytics"
  | "ai-commands";

export type VisualViewport = "desktop" | "tablet" | "mobile";

export type VisualNodeKind =
  | "hero"
  | "section"
  | "header"
  | "footer"
  | "cta"
  | "proof"
  | "media"
  | "other";

export type VisualNode = {
  id: string;
  exportName: string;
  path: string;
  kind: VisualNodeKind;
  label: string;
  /** Editable headline / title extracted from source when available. */
  text?: string;
  /** Image URL for media / hero nodes. */
  imageUrl?: string;
  locked?: boolean;
};

export type VisualDesignTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  headingFont: string;
  bodyFont: string;
  sectionY: string;
};

export type VisualDocument = {
  version: 1;
  generationId: string;
  brandName: string;
  nodes: VisualNode[];
  tokens: VisualDesignTokens;
  selectedNodeId: string | null;
  viewport: VisualViewport;
  /** Reserved for future plugins (marketplace, A/B, analytics…). */
  extensions: Partial<Record<VisualEditorExtensionSlot, Record<string, unknown>>>;
  dirty: boolean;
  updatedAt: string;
};

export type VisualHistoryEntry = {
  document: VisualDocument;
  label: string;
};

export type VisualEditorSavePayload = {
  actions: WebsiteEditAction[];
  applyAi?: boolean;
};

export type VisualEditorCapability = {
  id: string;
  label: string;
  slot: VisualEditorExtensionSlot;
  enabled: boolean;
};
