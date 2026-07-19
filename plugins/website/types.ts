import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import type { GeneratedProjectFile, GenerationProgressEvent } from "@/lib/ai/types";
import type { PlannedFile } from "@/lib/ai/planner";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { WebsiteOptimizationReport } from "@/lib/ai-core/optimizer/types";
import type {
  AssetManifest,
  BusinessProfile,
  DesignSystem,
  QualityReport,
  WebsiteStrategy,
} from "@/plugins/website/layers/types";

export type {
  AssetManifest,
  AssetItem,
  AssetRole,
  BusinessProfile,
  ContentStrategy,
  DesignStylePreset,
  DesignSystem,
  QualityReport,
  WebsiteStrategy,
} from "@/plugins/website/layers/types";

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
  /** Smart Template Engine id (auto-selected by DeepSeek when omitted). */
  templateId?: string;
  mode?: WebsiteGenerationMode;
  parentGenerationId?: string;
  continueInstruction?: string;
  /** AI Website Optimizer Engine — audit + apply improvements */
  optimizeWithAi?: boolean;
  /** Prior project files when regenerating / continuing */
  previousFiles?: GeneratedProjectFile[];
  previousTitle?: string;
  previousDescription?: string;
  /** Prior layer artifacts for scoped continue */
  previousBusinessProfile?: BusinessProfile;
  previousStrategy?: WebsiteStrategy;
  previousDesignSystem?: DesignSystem;
  previousAssetManifest?: AssetManifest;
  /** Authenticated user id for asset storage uploads */
  userId?: string;
};

export type WebsiteGenerationProgressEvent =
  | "Analyzing business idea..."
  | "Building strategy..."
  | "Creating design system..."
  | "Generating assets..."
  | "Creating blueprint..."
  | "Planning files..."
  | "Generating files..."
  | "Running quality check..."
  | "Improving weak sections..."
  | "Validating project..."
  | "Building ZIP..."
  | "Saving project..."
  | "Building product preview..."
  | "Saving project to workspace..."
  | "Done."
  | "Analyzing..."
  | GenerationProgressEvent;

export type WebsiteProjectAnalysis = ProjectCapabilityFlags & {
  projectName: string;
  projectType: string;
  pages: string[];
  features: string[];
  designSystem: string[];
  technologies: string[];
  databaseProvider: "prisma" | "supabase" | "none";
  /** Full business idea profile (Design Engine layer 1) */
  businessProfile: BusinessProfile;
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
  strategy: WebsiteStrategy;
  designSystem: DesignSystem;
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
  businessProfile?: BusinessProfile;
  strategy?: WebsiteStrategy;
  designSystem?: DesignSystem;
  assetManifest?: AssetManifest;
  qualityReport?: QualityReport;
  /** Phase 8 SEO Engine package (optional; Core path) */
  seoPackage?: CoreSeoPackage;
  /** Phase 8 Performance Engine report (optional; Core path) */
  performanceReport?: CorePerformanceReport;
  /** AI Website Optimizer Engine report */
  optimizationReport?: WebsiteOptimizationReport;
};

export type { GeneratedProjectFile };
