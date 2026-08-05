import type { TbdpComponentCatalogEntry } from "@/lib/design-platform/components/catalog";
import type { TbdpExperienceConfig } from "@/lib/design-platform/experience/core/types";
import type { TbdpDesignTokens } from "@/lib/design-platform/tokens/types";
import type {
  TbdpAiSelectionResult,
  TbdpExperienceProfileDefinition,
  TbdpSectorDnaProfile,
  TbdpSectorId,
} from "@/lib/design-platform/sector-dna";
import type { TbdpResolvedSectorDna } from "@/lib/design-platform/sector-dna/resolve";

export type TbdpTemplateArchitectureVersion = "v1" | "v2";

export type TbdpThemeMode = "light" | "dark" | "auto";

export type TbdpThemeSource = "brand" | "industry" | "user" | "system";

export type TbdpGenerationGoal = "conversion" | "trust" | "engagement" | "information";

/** Unified language context across website, generation, and template layers. */
export type TbdpLanguageContext = {
  websiteLanguage: string;
  generationLanguage: string;
  templateLanguage: string;
  localeCode: string;
  htmlLang: string;
  direction: "ltr" | "rtl";
  rtl: boolean;
  typographyProfile: "latin-ltr" | "latin-rtl" | "arabic-rtl" | "arabic-ltr";
  fontHint?: string;
};

/** Theme resolution — future-ready for brand, industry, and user themes. */
export type TbdpThemeResolution = {
  mode: TbdpThemeMode;
  resolvedMode: "light" | "dark";
  source: TbdpThemeSource;
  industryThemeId?: string;
  brandThemeId?: string;
  userThemeId?: string;
};

/** Template-level design resolution output. */
export type TbdpTemplateResolution = {
  templateId: string;
  architectureVersion: TbdpTemplateArchitectureVersion;
  sectorDnaId: TbdpSectorId;
  designTokens: TbdpDesignTokens;
  experience: TbdpExperienceConfig;
  componentPreferences: string[];
  experienceProfileId: string;
  language: TbdpLanguageContext;
  theme: TbdpThemeResolution;
  layoutId: string;
  pageFlow: string[];
  motionPresets: string[];
  cssVariables: string;
  experienceCss: string;
};

/** Unified design context — single source for builder, AI, and templates. */
export type TbdpDesignContext = {
  meta: {
    integrationPhase: string;
    integrationVersion: string;
    resolvedAt: string;
    sectorDnaId: TbdpSectorId;
    contextHash: string;
  };
  sector: TbdpSectorDnaProfile;
  sectorResolved: TbdpResolvedSectorDna;
  experienceProfile: TbdpExperienceProfileDefinition;
  aiSelections: TbdpAiSelectionResult["selections"];
  components: {
    preferred: string[];
    registry: TbdpComponentCatalogEntry[];
  };
  language: TbdpLanguageContext;
  theme: TbdpThemeResolution;
  template?: TbdpTemplateResolution;
};

export type TbdpDesignResolverInput = {
  sectorId: TbdpSectorId;
  language?: string;
  generationLanguage?: string;
  templateLanguage?: string;
  direction?: "ltr" | "rtl";
  goal?: TbdpGenerationGoal;
  themeMode?: TbdpThemeMode;
  themeSource?: TbdpThemeSource;
  brandThemeId?: string;
  userThemeId?: string;
  prefersReducedMotion?: boolean;
  templateId?: string;
  architectureVersion?: TbdpTemplateArchitectureVersion;
};

export type TbdpTemplateResolverInput = {
  templateId: string;
  sectorId?: TbdpSectorId;
  industryId?: string;
  language?: string;
  generationLanguage?: string;
  goal?: TbdpGenerationGoal;
  themeMode?: TbdpThemeMode;
  architectureVersion?: TbdpTemplateArchitectureVersion;
  prefersReducedMotion?: boolean;
};

export type TbdpBuilderBridgeInput = {
  prompt?: string;
  language?: string;
  industryId?: string;
  sectorId?: TbdpSectorId;
  templateId?: string;
  websiteStructureTemplateId?: string;
  templateIntelligenceId?: string;
  components?: string[];
  theme?: string;
  goal?: TbdpGenerationGoal;
};

export type TbdpBuilderBridgeOutput = {
  /** Original input preserved — builder behavior unchanged when fields omitted. */
  enrichment: {
    sectorDnaId?: TbdpSectorId;
    tbdpIntegrationVersion: string;
    tbdpDesignContextHash?: string;
    suggestedComponents?: string[];
    suggestedLayoutId?: string;
    suggestedPageFlow?: string[];
    typographyProfile?: string;
    direction?: "ltr" | "rtl";
  };
  designContext?: TbdpDesignContext;
  /** Passive metadata for project.settings — safe to ignore. */
  projectSettingsPatch?: Record<string, string>;
};

export type TbdpAiBridgeInput = {
  sectorId?: TbdpSectorId;
  industryId?: string;
  prompt?: string;
  language?: string;
  goal?: TbdpGenerationGoal;
  direction?: "ltr" | "rtl";
};

export type TbdpAiBridgeOutput = {
  sectorDnaId: TbdpSectorId;
  designContext: TbdpDesignContext;
  componentIds: string[];
  layoutId: string;
  pageFlow: string[];
  heroComponent: string;
  navComponent: string;
  ctaComponent: string;
  motionPresets: string[];
  cardComponent: string;
  primaryButton: string;
};

export type TbdpTemplateBridgeInput = {
  templateId: string;
  sectorId?: TbdpSectorId;
  industryId?: string;
  language?: string;
  architectureVersion?: TbdpTemplateArchitectureVersion;
  themeMode?: TbdpThemeMode;
};

export type TbdpTemplateBridgeOutput = {
  templateId: string;
  architectureVersion: TbdpTemplateArchitectureVersion;
  designContext: TbdpDesignContext;
  templateResolution: TbdpTemplateResolution;
  /** Advisory token layer — merge alongside V1/V2 template output. */
  tbdpCssLayer: string;
  foundationsAvailable: boolean;
  experienceAvailable: boolean;
  sectorDnaAvailable: boolean;
};

export type TbdpBuilderLifecyclePhase =
  | "pre-generation"
  | "template-selected"
  | "post-apply"
  | "preview";

export type TbdpLifecycleEvent = {
  phase: TbdpBuilderLifecyclePhase;
  timestamp: string;
  designContext: TbdpDesignContext;
};
