import type { FileCategory, PlannedFile } from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { FileDependencyEdge } from "@/lib/ai-core/file-generation/types";

export type ContextGraphEdge = FileDependencyEdge & {
  graph: "structural" | "import" | "route" | "layout" | "component" | "theme";
};

export type ContextResolutionOptions = {
  targetPath: string;
  targetCategory: FileCategory;
  availableFiles: GeneratedProjectFile[];
  filePlans: PlannedFile[];
  dependsOn?: string[];
  contextPolicy?: "snapshot" | "strict-serial";
  composeHomePage?: boolean;
  charLimitPerFile?: number;
  charBudget?: number;
  productId?: "website" | "webapp" | "landing-page" | "generic";
};

export type ContextResolutionStats = {
  inputFileCount: number;
  outputFileCount: number;
  inputChars: number;
  outputChars: number;
  requiredPaths: string[];
  charsSaved: number;
  filesPruned: number;
};

export type ContextResolutionResult = {
  files: GeneratedProjectFile[];
  stats: ContextResolutionStats;
};

export type PromptContextFile = {
  path: string;
  language: string;
  content: string;
};
