import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import type { GeneratedProjectFile, GenerationProgressEvent } from "@/lib/ai/types";
import type { PlannedFile } from "@/lib/ai/planner";
import type {
  AppDesignBlueprint,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import type { AppVersionHistory } from "@/lib/ai-core/app-design-platform/versions";
import type {
  UniversalBlueprint,
  UniversalServiceBlueprint,
} from "@/lib/ai-core/universal-planner";

export type WebAppPluginInput = {
  prompt: string;
  appType: string;
  language: string;
  designStyle: string;
  colorStyle: string;
  features: string[];
  /**
   * Universal AI Planner metadata (optional, feature-flagged).
   * Injected at API entrypoints; adapters/layers may consume it later.
   */
  universalPlannerEnabled?: boolean;
  universalPlannerTraceRef?: string;
  universalPlannerBlueprint?: UniversalBlueprint;
  universalPlannerAppPlan?: UniversalServiceBlueprint;
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

/** Single Stage-2 LLM planning document (structured JSON between components). */
export type WebAppUnifiedPlanning = {
  analysis: WebAppAnalysis;
  strategy: {
    positioning: string;
    pages: string[];
    sections: string[];
    ctas: string[];
    seoFocus: string[];
  };
  universalBlueprint: {
    intentSummary: string;
    goals: string[];
    constraints: string[];
    orderedServices: string[];
    selectedServiceId: string;
  };
  databaseSchema: {
    provider: string;
    tables: Array<{ name: string; fields: string[]; relations?: string[] }>;
  };
  apiPlan: {
    routes: Array<{ path: string; methods: string[]; purpose: string }>;
  };
  uiPlan: {
    layouts: string[];
    pages: string[];
    components: string[];
    navigation: string[];
    theme: string[];
  };
  filePlan: WebAppDynamicPlan;
  servicePlan: {
    services: string[];
    integrations: string[];
    authProvider: string;
  };
  dependencies: {
    npm: string[];
    devNpm: string[];
  };
  executionMetadata: {
    complexity: string;
    estimatedFileCount: number;
    generationMode: string;
    notes?: string[];
  };
  blueprint: WebAppBlueprint;
};

export type WebAppPlanResult = {
  blueprint: WebAppBlueprint;
  dynamicPlan: WebAppDynamicPlan;
  filePlans: PlannedFile[];
  flags: ProjectCapabilityFlags;
  /** Structured app design from App Design Platform (before code gen). */
  appDesign?: AppDesignBlueprint;
  appModel?: StructuredAppModel;
  /** Full single-request planning document when Stage 2 used unified planning. */
  unifiedPlanning?: WebAppUnifiedPlanning;
  /** Analysis refined by the single Stage-2 planning response. */
  refinedAnalysis?: WebAppAnalysis;
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
