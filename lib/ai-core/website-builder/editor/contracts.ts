/**
 * Website editor contracts (Phase 6).
 * Visual editing as domain commands over the active WebsitePlan. No UI or publish.
 */

import type { ThemeColors, ThemeFonts } from "@/lib/ai-core/website-builder/domain/contracts";
import type { WebsiteGeneratedStructure } from "@/lib/ai-core/website-builder/generation/contracts";

export type EditorSelection = {
  pageId: string | null;
  sectionId: string | null;
  componentId: string | null;
};

export type EditorAutosave = {
  dirty: boolean;
  revision: number;
  savedAt: string | null;
};

export type EditorHistoryState = {
  past: WebsiteGeneratedStructure[];
  future: WebsiteGeneratedStructure[];
};

export type WebsiteEditorSession = {
  id: string;
  userId: string;
  projectId: string;
  planId: string;
  selection: EditorSelection;
  structure: WebsiteGeneratedStructure;
  history: EditorHistoryState;
  autosave: EditorAutosave;
  appliedCommandKeys: string[];
  updatedAt: string;
};

export type EditorCommand =
  | { type: "selectPage"; pageId: string }
  | { type: "selectSection"; pageId: string; sectionId: string }
  | { type: "selectComponent"; pageId: string; sectionId: string; componentId: string }
  | { type: "editText"; componentId: string; text: string }
  | { type: "editImage"; componentId: string; alt: string; src?: string }
  | { type: "editButton"; componentId: string; text: string }
  | { type: "editColors"; colors: ThemeColors }
  | { type: "editFonts"; fonts: ThemeFonts }
  | { type: "reorderSections"; pageId: string; sectionIds: string[] }
  | { type: "duplicateSection"; sectionId: string }
  | { type: "duplicateComponent"; componentId: string }
  | { type: "deletePage"; pageId: string }
  | { type: "deleteSection"; sectionId: string }
  | { type: "deleteComponent"; componentId: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "autosave" };

export type ApplyEditorCommandInput = {
  session: WebsiteEditorSession;
  command: EditorCommand;
  actorUserId: string;
  idempotencyKey?: string;
};

export type WebsiteEditorStore = {
  get(key: string): WebsiteEditorSession | undefined;
  set(key: string, session: WebsiteEditorSession): void;
};
