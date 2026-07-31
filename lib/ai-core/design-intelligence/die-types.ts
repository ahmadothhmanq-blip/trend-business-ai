import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import type { DesignDNAPrinciples } from "@/lib/ai-core/design-dna/types";
import type { PremiumStyleId } from "@/lib/ai-core/design-system/premium/types";
import type { LayoutVariationId } from "@/lib/ai-core/design-intelligence/layout-selection";
import type { DesignPlanColorSystem, DesignPlanTypographySystem } from "@/lib/ai-core/design-plan/types";

export const DESIGN_INTELLIGENCE_TRACE_KEY = "designIntelligenceTrace";
export const DESIGN_INTELLIGENCE_SPEC_KEY = "designSystemSpec";
export const DESIGN_INTELLIGENCE_ENGINE_ID = "design-intelligence-engine";
export const DESIGN_INTELLIGENCE_ENGINE_VERSION = "1.0.0";

export type DesignIntelligencePhaseId =
  | "policy-resolve"
  | "brand-dna"
  | "layout-reasoning"
  | "color-system"
  | "typography"
  | "spacing-tokens"
  | "component-styling"
  | "hierarchy"
  | "responsive"
  | "accessibility"
  | "validation"
  | "spec-lock";

export type DesignTraceEntry = {
  id: string;
  phase: DesignIntelligencePhaseId;
  ruleId: string;
  passed: boolean;
  severity: "info" | "warning" | "error";
  message: string;
  knowledgeEntryId?: string;
  timestamp: string;
};

export type DesignIntelligenceTrace = {
  version: "1";
  engineId: typeof DESIGN_INTELLIGENCE_ENGINE_ID;
  engineVersion: typeof DESIGN_INTELLIGENCE_ENGINE_VERSION;
  createdAt: string;
  industryId: string;
  phases: DesignIntelligencePhaseId[];
  entries: DesignTraceEntry[];
  summary: string;
};

export type DesignPolicy = {
  industryId: string;
  knowledgeEntryId: string;
  layoutFamily: string;
  allowedPremiumStyleIds: PremiumStyleId[];
  defaultPremiumStyleId: PremiumStyleId;
  defaultLayoutVariationId: LayoutVariationId;
  forbiddenLayoutVariationIds: LayoutVariationId[];
  spacingDensity: "airy" | "balanced" | "compact";
  colorStrategy: string;
  typographyStrategy: string;
  componentCardStyle: string;
  navigationStyle: string;
  minContrastRatio: number;
  responsiveStrategy: "mobile-first" | "fluid" | "adaptive";
  visualHierarchyNotes: string[];
  accessibilityPolicies: string[];
  lockedColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    surface: string;
  } | null;
  lockedTypography: {
    display: string;
    heading: string;
    body: string;
  } | null;
  requiredSections: string[];
};

export type DesignSystemSpec = {
  version: "1";
  industryId: string;
  layoutFamily: string;
  premiumStyleId: PremiumStyleId;
  layoutVariationId: LayoutVariationId;
  brandDna: DesignDNAPrinciples | null;
  colorSystem: DesignPlanColorSystem;
  typographySystem: DesignPlanTypographySystem;
  spacing: {
    density: "airy" | "balanced" | "compact";
    rhythm: string;
    sectionPadding: string;
    notes: string;
  };
  layoutComposition: {
    heroTreatment: string;
    sectionLayout: string;
    cardStyle: string;
    navigationStyle: string;
    compositionMode: string;
  };
  componentStyling: {
    cards: string;
    buttons: string;
    forms: string;
    navigation: string;
  };
  visualHierarchy: {
    heroEmphasis: string;
    ctaEmphasis: string;
    sectionRhythm: string;
    notes: string[];
  };
  responsive: {
    strategy: "mobile-first" | "fluid" | "adaptive";
    breakpoints: string[];
    tapTargetMinPx: number;
  };
  accessibility: {
    minContrastRatio: number;
    policies: string[];
    motionReduce: boolean;
  };
  intelligence: DesignIntelligenceBrief;
};

export type DesignIntelligenceValidation = {
  valid: boolean;
  warnings: string[];
  errors: string[];
  trace: DesignTraceEntry[];
  corrections: string[];
};

export type DesignIntelligenceEngineResult = {
  spec: DesignSystemSpec;
  intelligence: DesignIntelligenceBrief;
  validation: DesignIntelligenceValidation;
  trace: DesignIntelligenceTrace;
  policy: DesignPolicy;
};
