import type { FileCategory } from "@/lib/ai/planner";

export type PromptProductId =
  | "website"
  | "webapp"
  | "landing-page"
  | "generic";

export type FilePromptPlan = {
  path: string;
  purpose?: string;
  language?: string;
  category?: string;
};

export type FilePromptPayload = {
  analysis: unknown;
  blueprint: unknown;
  dynamicPlan: Record<string, unknown>;
  projectTree: unknown;
  strategy?: unknown;
  designSystem?: unknown;
  filePlan?: FilePromptPlan;
  productId?: PromptProductId;
};

export type CompactedFilePromptPayload = FilePromptPayload & {
  stats: PromptCompactionStats;
};

export type PromptCompactionStats = {
  enabled: boolean;
  analysisCharsBefore: number;
  analysisCharsAfter: number;
  blueprintCharsBefore: number;
  blueprintCharsAfter: number;
  dynamicPlanCharsBefore: number;
  dynamicPlanCharsAfter: number;
  projectTreeCharsBefore: number;
  projectTreeCharsAfter: number;
  strategyCharsBefore: number;
  strategyCharsAfter: number;
  designSystemCharsBefore: number;
  designSystemCharsAfter: number;
  totalMetadataCharsBefore: number;
  totalMetadataCharsAfter: number;
  metadataReductionPercent: number;
};

export type PromptAssemblyStats = PromptCompactionStats & {
  promptChars: number;
  assemblyDurationMs: number;
};

export type PromptFragmentId =
  | "production-architecture-guide"
  | "file-generation-rules"
  | "complexity-guide";

export type PromptFragment = {
  id: PromptFragmentId;
  content: string;
};

export type MetadataLayerEntry = {
  key: string;
  value: unknown;
  charSize: number;
};
