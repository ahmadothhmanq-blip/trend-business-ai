import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import type { GeneratedProjectFile, GenerationProgressEvent } from "@/lib/ai/types";
import type { PlannedFile } from "@/lib/ai/planner";

export type WebsiteGenerationMode =
  | "generate"
  | "regenerate"
  | "continue"
  | "retry";

export type WebsiteGenerationInput = {
  prompt: string;
  projectType: string;
  projectKind: "website" | "web_application";
  language: string;
  theme: string;
  features: string[];
  mode?: WebsiteGenerationMode;
  parentGenerationId?: string;
  continueInstruction?: string;
  /** Prior project files when regenerating / continuing */
  previousFiles?: GeneratedProjectFile[];
  previousTitle?: string;
  previousDescription?: string;
};

export type WebsiteGenerationProgressEvent =
  | "Analyzing..."
  | "Creating blueprint..."
  | "Planning files..."
  | "Generating files..."
  | "Validating project..."
  | "Building ZIP..."
  | "Saving project..."
  | "Done."
  | GenerationProgressEvent;

export type WebsiteProjectAnalysis = ProjectCapabilityFlags & {
  projectName: string;
  projectType: string;
  pages: string[];
  features: string[];
  designSystem: string[];
  technologies: string[];
  databaseProvider: "prisma" | "supabase" | "none";
};

export type WebsiteProjectBlueprint = {
  title: string;
  description: string;
  pages: string[];
  sections: string[];
  colorPalette: string[];
  typography: string[];
  components: string[];
  content: string[];
  seo: string[];
  roadmap: string[];
};

export type WebsiteDynamicPlan = {
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

export type WebsitePlanResult = {
  blueprint: WebsiteProjectBlueprint;
  dynamicPlan: WebsiteDynamicPlan;
  filePlans: PlannedFile[];
  flags: ProjectCapabilityFlags;
};

export type GeneratedWebsiteProject = {
  projectKind: "website" | "web_application";
  title: string;
  description: string;
  prompt?: string;
  generatedAt?: string;
  settings?: {
    framework?: string;
    styling?: string;
    packageManager?: string;
    deploymentTarget?: string;
    complexity?: string;
    estimatedFileCount?: string;
    requiresAuth?: string;
    requiresDatabase?: string;
    requiresDashboard?: string;
    isEcommerce?: string;
    isSaas?: string;
    databaseProvider?: "prisma" | "supabase" | "none";
  };
  progressEvents?: WebsiteGenerationProgressEvent[];
  pages: string[];
  sections: string[];
  colorPalette: string[];
  typography: string[];
  components: string[];
  content: string[];
  seo: string[];
  roadmap: string[];
  files: GeneratedProjectFile[];
};

export type { GeneratedProjectFile };
