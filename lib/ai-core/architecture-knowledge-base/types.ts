export const ARCHITECTURE_KNOWLEDGE_BASE_VERSION = "1.0.0";

export type KnowledgeEntryKind =
  | "industry"
  | "layout-family"
  | "layout-taxonomy"
  | "structure-template"
  | "template-intelligence"
  | "visual-theme"
  | "image-policy"
  | "seo-policy"
  | "accessibility-policy"
  | "localization-policy"
  | "business-rules"
  | "validation-policy"
  | "style-routing-policy";

export type KnowledgeEntryBase = {
  id: string;
  version: string;
  kind: KnowledgeEntryKind;
  label: string;
  metadata?: Record<string, unknown>;
  /** Inherit defaults from another entry of the same kind (or industry → industry). */
  extends?: string;
  /** Field-level overrides applied after inheritance merge. */
  overrides?: Record<string, unknown>;
  aliases?: string[];
  deprecated?: boolean;
  deprecatedBy?: string;
};

export type IndustryKnowledgeEntry = KnowledgeEntryBase & {
  kind: "industry";
  defaultLayoutFamily: string;
  allowedLayoutFamilies: string[];
  defaultStructureTemplateId: string;
  forbiddenStructureTemplateIds?: string[];
  forbiddenPremiumTemplateIds?: string[];
  defaultVisualThemeId: string;
  editorialLayoutAllowed: boolean;
  premiumVisualThemesWhenLuxury?: string[];
  imagePolicyId?: string;
  seoPolicyId?: string;
  accessibilityPolicyId?: string;
  localizationPolicyId?: string;
  businessRulesId?: string;
};

export type LayoutFamilyKnowledgeEntry = KnowledgeEntryBase & {
  kind: "layout-family";
  description?: string;
};

export type LayoutTaxonomyKnowledgeEntry = KnowledgeEntryBase & {
  kind: "layout-taxonomy";
  editorialLayoutStructures: string[];
  editorialPageTopologies: string[];
};

export type StructureTemplateKnowledgeEntry = KnowledgeEntryBase & {
  kind: "structure-template";
  templateIntelligenceId: string;
  premiumTemplateId?: string;
  layoutFamily?: string;
};

export type VisualThemeKnowledgeEntry = KnowledgeEntryBase & {
  kind: "visual-theme";
  templateIntelligenceId: string;
  editorialTokens?: boolean;
};

export type ImagePolicyKnowledgeEntry = KnowledgeEntryBase & {
  kind: "image-policy";
  minKeywords: number;
  enforceRoutingAlignment: boolean;
  stockPackId?: string;
};

export type SeoPolicyKnowledgeEntry = KnowledgeEntryBase & {
  kind: "seo-policy";
  requireStructuredData: boolean;
  minMetaDescriptionLength: number;
};

export type AccessibilityPolicyKnowledgeEntry = KnowledgeEntryBase & {
  kind: "accessibility-policy";
  minContrastRatio: number;
  requireAltText: boolean;
};

export type LocalizationPolicyKnowledgeEntry = KnowledgeEntryBase & {
  kind: "localization-policy";
  rtlIndustries?: string[];
  defaultLocaleStrategy: "prompt" | "browser" | "fixed";
};

export type BusinessRulesKnowledgeEntry = KnowledgeEntryBase & {
  kind: "business-rules";
  minSections: number;
  minComponents: number;
  minConfidenceWarning: number;
  requireHero: boolean;
};

export type ValidationPolicyKnowledgeEntry = KnowledgeEntryBase & {
  kind: "validation-policy";
  maxReplanAttempts: number;
  blockOnEditorialMismatch: boolean;
};

export type StyleRoutingPolicyKnowledgeEntry = KnowledgeEntryBase & {
  kind: "style-routing-policy";
  /** Ordered rules: first matching pattern wins. */
  rules: Array<{
    id: string;
    pattern: string;
    themeId: string;
    requiresEditorialIndustry?: boolean;
    industries?: string[];
  }>;
};

export type ArchitectureKnowledgeEntry =
  | IndustryKnowledgeEntry
  | LayoutFamilyKnowledgeEntry
  | LayoutTaxonomyKnowledgeEntry
  | StructureTemplateKnowledgeEntry
  | VisualThemeKnowledgeEntry
  | ImagePolicyKnowledgeEntry
  | SeoPolicyKnowledgeEntry
  | AccessibilityPolicyKnowledgeEntry
  | LocalizationPolicyKnowledgeEntry
  | BusinessRulesKnowledgeEntry
  | ValidationPolicyKnowledgeEntry
  | StyleRoutingPolicyKnowledgeEntry;

export type ExplainableLookup<T> = {
  value: T;
  entryId: string;
  entryVersion: string;
  resolvedFrom: string[];
  aliasesUsed: string[];
  inheritanceChain: string[];
};

export type KnowledgeIntegrityIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  entryId?: string;
  relatedEntryId?: string;
};