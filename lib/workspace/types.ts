import type {
  GenerationAttachmentMeta,
  GenerationMode,
  TokenUsage,
  WorkspaceType as DbWorkspaceType,
} from "@/types/database";

export type WorkspaceType = DbWorkspaceType;

export type WorkspaceSection = {
  heading: string;
  content: string;
};

export type WorkspaceOutput = {
  title: string;
  summary: string;
  sections: WorkspaceSection[];
  deliverables: string[];
  progressEvents?: string[];
  generatedAt?: string;
  source?: "deepseek" | "openai" | "claude" | "gemini" | "grok" | "llama" | "structured" | string;
  /** Product Engine product id (user → workspace → project lineage). */
  productId?: string;
  depth?: "focused" | "standard" | "deep";
  tokenUsage?: TokenUsage;
  generationTimeMs?: number;
  mode?: GenerationMode;
  continuedFrom?: string;
};

export type WorkspaceGenerationInput = {
  prompt: string;
  template?: string;
  language?: string;
  theme?: string;
  features?: string[];
  productId?: string;
  depth?: "focused" | "standard" | "deep";
  mode?: GenerationMode;
  parentGenerationId?: string;
  projectId?: string;
  continueInstruction?: string;
  previousOutput?: WorkspaceOutput;
  attachments?: GenerationAttachmentMeta[];
  provider?: string;
};

export const WORKSPACE_TYPES: WorkspaceType[] = [
  "brand",
  "creative",
  "content",
  "business",
  "manager",
  "marketing",
  "social",
  "audit",
];

export function isWorkspaceType(value: string): value is WorkspaceType {
  return WORKSPACE_TYPES.includes(value as WorkspaceType);
}
