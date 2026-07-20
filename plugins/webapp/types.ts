import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import type { GeneratedProjectFile, GenerationProgressEvent } from "@/lib/ai/types";
import type { PlannedFile } from "@/lib/ai/planner";
import type {
  AppDesignBlueprint,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import type { AppVersionHistory } from "@/lib/ai-core/app-design-platform/versions";

export type WebAppPluginInput = {
  prompt: string;
  appType: string;
  language: string;
  designStyle: string;
  colorStyle: string;
  features: string[];
};

export type WebAppProgressEvent =
  | "Analyzing requirements..."
  | "Creating blueprint..."
  | "Planning files..."
  | "Generating files..."
  | "Validating project..."
  | "Building ZIP..."
  | "Saving project..."
  | "Done."
  | GenerationProgressEvent;

export type WebAppAnalysis = ProjectCapabilityFlags & {
  appName: string;
  appType: string;
  complexity: "simple" | "moderate" | "complex";
  pages: string[];
  features: string[];
  technologies: string[];
  databaseTables: string[];
  apiEndpoints: string[];
  databaseProvider: "prisma" | "supabase" | "none";
};

export type WebAppBlueprint = {
  title: string;
  description: string;
  pages: string[];
  sections: string[];
  dataModels: string[];
  apiRoutes: string[];
  components: string[];
  navigation: string[];
  theme: string[];
  roadmap: string[];
};

export type WebAppDynamicPlan = {
  complexity: string;
  estimatedFileCount: number;
  layouts: string[];
  pages: string[];
  components: string[];
  apiRoutes: string[];
  hooks: string[];
  utilities: string[];
  types: string[];
  configs: string[];
  files: PlannedFile[];
};

export type WebAppPlanResult = {
  blueprint: WebAppBlueprint;
  dynamicPlan: WebAppDynamicPlan;
  filePlans: PlannedFile[];
  flags: ProjectCapabilityFlags;
  /** Structured app design from App Design Platform (before code gen). */
  appDesign?: AppDesignBlueprint;
  appModel?: StructuredAppModel;
};

export type WebAppOutput = {
  title: string;
  description: string;
  appType: string;
  framework: string;
  pages: { name: string; path: string; description: string }[];
  files: GeneratedProjectFile[];
  settings: Record<string, string>;
  appModel?: StructuredAppModel;
  appDesign?: AppDesignBlueprint;
  versionHistory?: AppVersionHistory;
};

export type { GeneratedProjectFile };
