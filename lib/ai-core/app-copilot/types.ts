/**
 * App Copilot — shared types (Phase 4).
 */

import type { AppAssistantResult } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { WebAppGeneration } from "@/types/webapp";
import type {
  CopilotChatTurn,
  CopilotCostHint,
  CopilotCrossProductSplit,
  CopilotReviewResult,
} from "@/lib/ai-core/copilot-kernel";

export type AppCopilotCapabilityUri =
  | "app.brand.color.set"
  | "app.catalog.add"
  | "app.catalog.remove"
  | "app.catalog.price.update"
  | "app.screen.add"
  | "app.screen.remove"
  | "app.settings.rename"
  | "app.role.add"
  | "app.feature.booking"
  | "app.design.redesign"
  | "app.data.add-model"
  | "app.backend.provision"
  | "app.admin.panel"
  | "app.assistant.continue"
  | "app.copilot.undo"
  | "app.advisory.unknown"
  | "app.advisory.compound"
  | "app.advisory.cross-product";

export type AppCopilotExecutorTier = "local" | "ai-continue" | "advisory";

export type AppCopilotExecutorKind = "local" | "ai-continue" | "advisory";

export type AppCopilotSelectionContext = {
  source?: "visual-editor" | "none";
  nodeId?: string;
  screenId?: string;
  componentType?: string;
  nodeLabel?: string;
};

export type AppCopilotCommandRequest = {
  command: string;
  expectedRevision?: number;
  idempotencyKey?: string;
  applyAi?: boolean;
  selectionContext?: AppCopilotSelectionContext;
  useClassifier?: boolean;
  sessionId?: string;
  useMemory?: boolean;
  includeReview?: boolean;
  linkedWebsiteGenerationId?: string;
};

export type AppCapabilityMatch = {
  uri: AppCopilotCapabilityUri;
  confidence: number;
  slots: Record<string, unknown>;
};

export type AppCopilotExecutionPlan = {
  capability: AppCopilotCapabilityUri;
  tier: AppCopilotExecutorTier;
  executor: AppCopilotExecutorKind;
};

export type AppCopilotCommandSuccess = {
  ok: true;
  capability: string;
  tier: AppCopilotExecutorTier;
  mutated: boolean;
  revision: number;
  aiRunId: string | null;
  fromIdempotency: boolean;
  summary: string;
  model?: StructuredAppModel;
  generation?: WebAppGeneration;
  files?: GeneratedProjectFile[];
  assistantResult?: AppAssistantResult;
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

export type AppCopilotCommandFailure = {
  ok: false;
  code: "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "SERVER" | "PROVIDER_UNAVAILABLE";
  error: string;
};

export type AppCopilotCommandResult =
  | AppCopilotCommandSuccess
  | AppCopilotCommandFailure;

export const APP_COPILOT_MVP_EXAMPLES = [
  "Change primary color to blue",
  "Add a new product called Widget",
  "Add a dashboard screen",
  "Add booking feature",
  "Redesign the application",
] as const;

export const APP_COPILOT_UNDO_MAX_DEPTH = 5;
