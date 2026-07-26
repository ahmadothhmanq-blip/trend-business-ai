/**
 * Website Copilot — shared types (Phase 1 + Phase 2 + Phase 3).
 */

import type { WebsiteImprovementSuggestion } from "@/lib/ai-core/website-editor/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

export type CopilotCapabilityUri =
  | "website.brand.color.set"
  | "website.design.style.modernize"
  | "website.section.add.testimonials"
  | "website.section.regenerate.hero"
  | "website.content.rewrite.home"
  | "website.page.add"
  | "website.image.replace.all"
  | "website.seo.improve"
  | "website.manage.catalog"
  | "website.manage.cms"
  | "website.copilot.undo"
  | "website.advisory.unknown"
  | "website.advisory.compound"
  | "website.advisory.cross-product";

export type CopilotExecutorTier = "local" | "ai-continue" | "advisory";

export type CopilotExecutorKind =
  | "local"
  | "ai-continue"
  | "advisory"
  | "structure"
  | "seo";

export type CopilotSelectionContext = {
  source?: "visual-editor" | "none";
  nodeId?: string;
  nodeLabel?: string;
  sectionKind?: string;
  componentExportName?: string;
};

export type CopilotCostTier = import("@/lib/ai-core/copilot-kernel").CopilotCostTier;
export type CopilotCostHint = import("@/lib/ai-core/copilot-kernel").CopilotCostHint;
export type CopilotReviewResult = import("@/lib/ai-core/copilot-kernel").CopilotReviewResult;
export type CopilotChatTurn = import("@/lib/ai-core/copilot-kernel").CopilotChatTurn;
export type CopilotCrossProductSplit =
  import("@/lib/ai-core/copilot-kernel").CopilotCrossProductSplit;

export type CopilotCommandRequest = {
  command: string;
  expectedRevision?: number;
  idempotencyKey?: string;
  applyAi?: boolean;
  selectionContext?: CopilotSelectionContext;
  /** Phase 3: LLM compound split when rules detect multiple capabilities. */
  useClassifier?: boolean;
  /** Phase 5: session memory id */
  sessionId?: string;
  /** Phase 5: default true when sessionId present */
  useMemory?: boolean;
  /** Phase 5: post-mutation quality review */
  includeReview?: boolean;
  /** Phase 5: linked app generation for cross-product hints */
  linkedAppGenerationId?: string;
};

export type CapabilityMatch = {
  uri: CopilotCapabilityUri;
  confidence: number;
  slots: Record<string, unknown>;
};

export type CopilotExecutionPlan = {
  capability: CopilotCapabilityUri;
  tier: CopilotExecutorTier;
  executor: CopilotExecutorKind;
};

export type CopilotEditResultPayload = {
  summary: string;
  actionsApplied: string[];
  appliedNotes: string[];
  suggestions: WebsiteImprovementSuggestion[];
  continueInstruction: string | null;
};

export type CopilotManageResultPayload = {
  summary: string;
  notes: string[];
  editCommand?: string | null;
};

export type CopilotSeoResultPayload = {
  summary: string;
  fixId: string;
  fixTitle: string;
  notes: string[];
};

export type CopilotCommandSuccess = {
  ok: true;
  capability: string;
  tier: CopilotExecutorTier;
  mutated: boolean;
  revision: number;
  aiRunId: string | null;
  fromIdempotency: boolean;
  summary: string;
  project?: GeneratedWebsiteProject;
  generation?: WebsiteGeneration;
  editResult?: CopilotEditResultPayload;
  manageResult?: CopilotManageResultPayload;
  seoResult?: CopilotSeoResultPayload;
  suggestions?: WebsiteImprovementSuggestion[];
  examples?: string[];
  warnings?: string[];
  previewVersion: string;
  costHint?: CopilotCostHint;
  classifierUsed?: boolean;
  splitCommands?: string[];
  executedCommandIndex?: number;
  executedCommandCount?: number;
  review?: CopilotReviewResult;
  memoryTurnCount?: number;
  crossProductSplit?: CopilotCrossProductSplit;
  thread?: CopilotChatTurn[];
};

export type CopilotCommandFailure = {
  ok: false;
  code: "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "SERVER" | "PROVIDER_UNAVAILABLE";
  error: string;
};

export type CopilotCommandResult = CopilotCommandSuccess | CopilotCommandFailure;

export const COPILOT_MVP_EXAMPLES = [
  "Change the primary color to #2563eb",
  "Make the design more modern",
  "Add a testimonials section",
  "Regenerate only the hero section",
  "Rewrite the homepage copy",
] as const;

export const COPILOT_PHASE2_EXAMPLES = [
  "Add an About page",
  "Replace all images with fresh photos",
  "Improve SEO for this site",
  "Add a new service to the catalog",
  "Add a blog post to CMS",
] as const;

export const COPILOT_UNDO_MAX_DEPTH = 5;
