/**
 * Website Builder workspace types (Milestone 1).
 */

import type { ManagedPageDef } from "@/lib/ai-core/website-management/types";
import type { VisualNodeKind } from "@/lib/ai-core/visual-editor/types";

export type BuilderSectionView = {
  id: string;
  exportName: string;
  label: string;
  kind: VisualNodeKind;
  locked?: boolean;
};

export type BuilderPageView = Pick<
  ManagedPageDef,
  "route" | "label" | "path" | "purpose"
> & {
  isHome: boolean;
  editableInCanvas: boolean;
};

export type BuilderWorkspaceStructure = {
  pages: BuilderPageView[];
  sections: BuilderSectionView[];
  selectedPageRoute: string;
};

export type BuilderVersionSnapshot = {
  id: string;
  generationId: string;
  label: string;
  createdAt: string;
  revision?: number;
  project: unknown;
};

export type BuilderAutosaveState = "idle" | "pending" | "saving" | "saved" | "error";
