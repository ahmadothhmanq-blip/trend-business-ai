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
} from "@/lib/website/types/layers";

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
} from "@/lib/website/types/layers";

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
  templateId?: string;
  marketplaceTemplateId?: string;
  templateStyle?: string;
  designPreset?: string;
  templateIntelligenceId?: string;
  websiteStructureTemplateId?: string;
  websiteThemeId?: string;
  templateIntelligenceCategory?: string;
  brandIdentityId?: string;
  locale?: string;
  formEmailTo?: string;
  formWebhookUrl?: string;
  industryId?: string;
  components?: string[];
  designSystem?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
    displayFont?: string;
    bodyFont?: string;
  };
  mode?: WebsiteGenerationMode;
  parentGenerationId?: string;
  continueInstruction?: string;
  optimizeWithAi?: boolean;
  generationProfile?: "fast" | "professional" | "ultra";
  /** Server-resolved billing hint — professional default for paid users. */
  hasPaidPlan?: boolean;
  billingPlanId?: string;
  previousFiles?: GeneratedProjectFile[];
  previousTitle?: string;
  previousDescription?: string;
  previousBusinessProfile?: BusinessProfile;
  previousStrategy?: WebsiteStrategy;
  previousDesignSystem?: DesignSystem;
  previousAssetManifest?: AssetManifest;
  userId?: string;
  agencyContract?: import("@/lib/ai-core/agency-orchestrator").AgencyGenerationContract;
  masterWebsitePlan?: import("@/lib/ai-core/master-planner").MasterWebsitePlan;
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
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
  optimizationReport?: WebsiteOptimizationReport;
  conversionReport?: import("@/lib/ai-core/conversion").ConversionOptimizationReport;
  seoPerformanceReport?: import("@/lib/ai-core/seo-performance").SeoPerformanceReport;
  designCriticReport?: import("@/lib/ai-core/design-critic").DesignCriticReport;
  designPlan?: import("@/lib/ai-core/design-plan").VisualDesignPlan;
  editorSuggestions?: import("@/lib/ai-core/website-editor").WebsiteEditorSuggestionsReport;
  finalQualityReport?: import("@/lib/ai-core/final-quality").FinalWebsiteQualityReport;
  unifiedQualityScores?: import("@/lib/ai-core/quality-authority").UnifiedQualityScores;
  semanticContentQualityReport?: import("@/lib/ai-core/semantic-content-quality").SemanticContentQualityReport;
  visualDesignQualityReport?: import("@/lib/ai-core/visual-design-quality").VisualDesignQualityReport;
  unifiedQualityReport?: import("@/lib/ai-core/quality-platform").UnifiedQualityReport;
  qualityDashboard?: import("@/lib/ai-core/quality-platform").UnifiedQualityDashboardModel;
  agencyContract?: import("@/lib/ai-core/agency-orchestrator").AgencyGenerationContract;
  platformRevision?: import("@/lib/website/platform/types").BlueprintPlatformRevision;
  waveGenerationState?: import("@/lib/website/wave-checkpoint-engine").WaveGenerationState;
  /** Review Studio version history and snapshots (Phase 1 UI) */
  reviewStudioState?: import("@/lib/website/review-studio/types").ReviewStudioPersistedState;
};

export type { GeneratedProjectFile };
