export type WorkspaceType =
  | "brand"
  | "creative"
  | "content"
  | "business"
  | "manager"
  | "marketing"
  | "social"
  | "audit";

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
  source?: "openai" | "anthropic" | "deepseek" | "structured";
};

export type WorkspaceGenerationInput = {
  prompt: string;
  template?: string;
  language?: string;
  theme?: string;
  features?: string[];
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
