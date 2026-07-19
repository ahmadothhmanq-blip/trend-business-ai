/**
 * Website Editor Intelligence — natural-language editing of generated sites.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type { VisualDesignPlan } from "@/lib/ai-core/design-plan/types";

export type WebsiteEditActionType =
  | "add-section"
  | "remove-section"
  | "replace-section"
  | "duplicate-section"
  | "reorder-sections"
  | "update-text"
  | "update-image"
  | "restyle-section"
  | "update-typography"
  | "update-colors"
  | "update-spacing"
  | "update-animations"
  | "rewrite-content"
  | "improve-layout"
  | "improve-conversion"
  | "change-design-style"
  | "improve-luxury";

export type WebsiteEditAction = {
  type: WebsiteEditActionType;
  target?: string;
  value?: string;
  sectionKind?: string;
  componentId?: string;
  replaceWith?: string;
  notes?: string;
  /** Source index for reorder / move (visual editor). */
  fromIndex?: number;
  /** Destination index for reorder / move (visual editor). */
  toIndex?: number;
};

export type UnderstoodSection = {
  exportName: string;
  path: string;
  kindHint: string;
  usedOnHome: boolean;
};

export type WebsiteUnderstanding = {
  brandName: string;
  homePath: string | null;
  sections: UnderstoodSection[];
  homeComponentOrder: string[];
  designTokens: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
    headingFont?: string;
    bodyFont?: string;
    sectionY?: string;
  };
  designPlan?: VisualDesignPlan | null;
  brandIdentity?: BrandIdentityBrief | null;
  imageCount: number;
  hasGlobalsCss: boolean;
  structureNotes: string[];
  summary: string;
};

export type WebsiteImprovementCategory =
  | "design"
  | "ux"
  | "conversion"
  | "seo"
  | "content"
  | "missing-section";

export type WebsiteImprovementSuggestion = {
  id: string;
  category: WebsiteImprovementCategory;
  title: string;
  description: string;
  /** Natural-language command that applies this suggestion. */
  command: string;
  priority: "high" | "medium" | "low";
  actions?: WebsiteEditAction[];
};

export type WebsiteEditorSuggestionsReport = {
  suggestions: WebsiteImprovementSuggestion[];
  summary: string;
  generatedAt: string;
};

export type WebsiteEditResult = {
  files: GeneratedProjectFile[];
  actionsApplied: WebsiteEditAction[];
  appliedNotes: string[];
  understanding: WebsiteUnderstanding;
  /** Remaining intent that needs full AI optimize continue. */
  continueInstruction?: string;
  suggestions: WebsiteImprovementSuggestion[];
  summary: string;
};
