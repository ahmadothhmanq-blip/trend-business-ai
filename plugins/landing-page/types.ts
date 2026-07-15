import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import type { GeneratedProjectFile, GenerationProgressEvent } from "@/lib/ai/types";
import type { PlannedFile } from "@/lib/ai/planner";

export type LandingPagePluginInput = {
  prompt: string;
  pageType: string;
  language: string;
  designStyle: string;
  colorStyle: string;
  sections: string[];
};

export type LPProgressEvent =
  | "Analyzing requirements..."
  | "Creating blueprint..."
  | "Planning files..."
  | "Generating files..."
  | "Validating project..."
  | "Building ZIP..."
  | "Saving project..."
  | "Done."
  | GenerationProgressEvent;

export type LPAnalysis = ProjectCapabilityFlags & {
  pageName: string;
  pageType: string;
  sections: string[];
  features: string[];
  technologies: string[];
  databaseProvider: "prisma" | "supabase" | "none";
};

export type LPBlueprint = {
  title: string;
  description: string;
  headline: string;
  subheadline: string;
  sections: string[];
  colorPalette: string[];
  typography: string[];
  components: string[];
  content: string[];
  seo: string[];
};

export type LPDynamicPlan = {
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

export type LPPlanResult = {
  blueprint: LPBlueprint;
  dynamicPlan: LPDynamicPlan;
  filePlans: PlannedFile[];
  flags: ProjectCapabilityFlags;
};

export type LPOutput = {
  title: string;
  description: string;
  pageType: string;
  framework: string;
  sections: { name: string; description: string }[];
  files: GeneratedProjectFile[];
  settings: Record<string, string>;
};

export type { GeneratedProjectFile };
