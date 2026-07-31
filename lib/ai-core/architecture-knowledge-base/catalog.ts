import type {
  ArchitectureKnowledgeEntry,
  BusinessRulesKnowledgeEntry,
  IndustryKnowledgeEntry,
  LayoutFamilyKnowledgeEntry,
  LayoutTaxonomyKnowledgeEntry,
  StyleRoutingPolicyKnowledgeEntry,
  ValidationPolicyKnowledgeEntry,
  VisualThemeKnowledgeEntry,
} from "@/lib/ai-core/architecture-knowledge-base/types";

const DEFAULT_POLICY_SUFFIX = "default";

function industry(
  partial: Pick<IndustryKnowledgeEntry, "id" | "label"> &
    Partial<Omit<IndustryKnowledgeEntry, "kind" | "version" | "id" | "label">>,
): IndustryKnowledgeEntry {
  const rootDefaults: Partial<IndustryKnowledgeEntry> = partial.extends
    ? {
        forbiddenStructureTemplateIds: [],
        forbiddenPremiumTemplateIds: [],
      }
    : {
        imagePolicyId: `image-policy-${DEFAULT_POLICY_SUFFIX}`,
        seoPolicyId: `seo-policy-${DEFAULT_POLICY_SUFFIX}`,
        accessibilityPolicyId: `accessibility-policy-${DEFAULT_POLICY_SUFFIX}`,
        localizationPolicyId: `localization-policy-${DEFAULT_POLICY_SUFFIX}`,
        businessRulesId: `business-rules-${DEFAULT_POLICY_SUFFIX}`,
        forbiddenStructureTemplateIds: [],
        forbiddenPremiumTemplateIds: [],
        defaultLayoutFamily: "classic-stack",
        allowedLayoutFamilies: ["classic-stack"],
        defaultStructureTemplateId: "modern-business",
        defaultVisualThemeId: "modern",
        editorialLayoutAllowed: false,
      };

  return {
    version: "1",
    kind: "industry",
    ...rootDefaults,
    ...partial,
  } as IndustryKnowledgeEntry;
}

function industryExtend(
  partial: Pick<IndustryKnowledgeEntry, "id" | "label" | "extends"> & {
    overrides?: IndustryKnowledgeEntry["overrides"];
    aliases?: string[];
  },
): IndustryKnowledgeEntry {
  return industry(partial);
}

/** Central Architecture Knowledge Base catalog — EDS-001 Phase A.75 SSOT. */
export const ARCHITECTURE_KNOWLEDGE_ENTRIES: ArchitectureKnowledgeEntry[] = [
  // --- Layout families ---
  {
    id: "commerce-grid",
    version: "1",
    kind: "layout-family",
    label: "Commerce Grid",
    metadata: { topology: "card-first-masonry" },
  },
  {
    id: "corporate-trust",
    version: "1",
    kind: "layout-family",
    label: "Corporate Trust",
  },
  {
    id: "editorial-magazine",
    version: "1",
    kind: "layout-family",
    label: "Editorial Magazine",
  },
  {
    id: "product-saas",
    version: "1",
    kind: "layout-family",
    label: "Product SaaS",
  },
  {
    id: "showroom",
    version: "1",
    kind: "layout-family",
    label: "Showroom",
  },
  {
    id: "hospitality",
    version: "1",
    kind: "layout-family",
    label: "Hospitality",
  },
  {
    id: "classic-stack",
    version: "1",
    kind: "layout-family",
    label: "Classic Stack",
  },

  // --- Layout taxonomy (editorial guards) ---
  {
    id: "layout-taxonomy-global",
    version: "1",
    kind: "layout-taxonomy",
    label: "Global Layout Taxonomy",
    editorialLayoutStructures: [
      "editorial-hero",
      "editorial-blog",
      "red-premium",
      "studio-portfolio",
    ],
    editorialPageTopologies: ["fullscreen-editorial"],
  },

  // --- Visual themes ---
  ...(
    [
      "luxury",
      "modern",
      "minimal",
      "corporate",
      "creative",
      "technology",
      "editorial",
      "bold",
    ] as const
  ).map(
    (id): VisualThemeKnowledgeEntry => ({
      id: `visual-theme-${id}`,
      version: "1",
      kind: "visual-theme",
      label: id,
      templateIntelligenceId: `ti-${id === "bold" ? "saas-growth" : id === "technology" ? "technology-dark" : id === "editorial" ? "red-premium" : id === "luxury" ? "luxury-noir" : `${id}-clean`}`,
      editorialTokens: id === "editorial",
      aliases: id === "luxury" ? ["premium", "noir"] : undefined,
    }),
  ),

  // --- Global policies ---
  {
    id: "image-policy-default",
    version: "1",
    kind: "image-policy",
    label: "Default Image Policy",
    minKeywords: 2,
    enforceRoutingAlignment: true,
  },
  {
    id: "seo-policy-default",
    version: "1",
    kind: "seo-policy",
    label: "Default SEO Policy",
    requireStructuredData: true,
    minMetaDescriptionLength: 120,
  },
  {
    id: "accessibility-policy-default",
    version: "1",
    kind: "accessibility-policy",
    label: "Default Accessibility Policy",
    minContrastRatio: 4.5,
    requireAltText: true,
  },
  {
    id: "localization-policy-default",
    version: "1",
    kind: "localization-policy",
    label: "Default Localization Policy",
    defaultLocaleStrategy: "prompt",
    rtlIndustries: [],
  },
  {
    id: "business-rules-default",
    version: "1",
    kind: "business-rules",
    label: "Default Business Rules",
    minSections: 3,
    minComponents: 2,
    minConfidenceWarning: 0.45,
    requireHero: true,
  },
  {
    id: "validation-policy-default",
    version: "1",
    kind: "validation-policy",
    label: "Default Validation Policy",
    maxReplanAttempts: 2,
    blockOnEditorialMismatch: true,
  },
  {
    id: "style-routing-policy-global",
    version: "1",
    kind: "style-routing-policy",
    label: "Global Style → Visual Theme Routing",
    rules: [
      {
        id: "editorial-style",
        pattern: "editorial|magazine|journal|newsletter",
        themeId: "editorial",
        requiresEditorialIndustry: true,
      },
      {
        id: "minimal-style",
        pattern: "minimal|clean|quiet|simple|scandinavian",
        themeId: "minimal",
      },
      {
        id: "corporate-style",
        pattern: "corporate|enterprise|trust|professional|legal",
        themeId: "corporate",
      },
      {
        id: "creative-style",
        pattern: "creative|studio|portfolio|playful",
        themeId: "creative",
      },
      {
        id: "tech-style",
        pattern: "tech|saas|software|ai|digital|b2b|platform",
        themeId: "technology",
      },
      {
        id: "bold-style",
        pattern: "bold|conversion|growth|demo",
        themeId: "bold",
      },
      {
        id: "luxury-commerce",
        pattern: "luxury|premium|exclusive|gold|boutique|high-end",
        themeId: "luxury",
        industries: ["furniture", "ecommerce", "automotive"],
      },
      {
        id: "luxury-general",
        pattern: "luxury|premium|exclusive|gold|boutique|high-end",
        themeId: "luxury",
      },
      {
        id: "fashion-editorial",
        pattern: "editorial|magazine|red|fashion",
        themeId: "editorial",
        requiresEditorialIndustry: true,
      },
    ],
  },

  // --- Industries ---
  industry({
    id: "furniture",
    label: "Furniture",
    aliases: [
      "furnish",
      "möbel",
      "home-furniture",
      "home-furniture-store",
      "furniture-showroom",
    ],
    defaultLayoutFamily: "commerce-grid",
    allowedLayoutFamilies: ["commerce-grid", "showroom", "classic-stack"],
    defaultStructureTemplateId: "ecommerce-atelier",
    forbiddenStructureTemplateIds: [
      "fashion-runway",
      "travel-horizon",
      "law-firm-authority",
      "portfolio-showcase",
      "architecture-monograph",
    ],
    forbiddenPremiumTemplateIds: ["travel", "law"],
    defaultVisualThemeId: "luxury",
    premiumVisualThemesWhenLuxury: ["luxury"],
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "ecommerce",
    label: "E-commerce",
    aliases: ["retail", "shop", "store"],
    defaultLayoutFamily: "commerce-grid",
    allowedLayoutFamilies: ["commerce-grid", "classic-stack"],
    defaultStructureTemplateId: "ecommerce-atelier",
    defaultVisualThemeId: "modern",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "restaurant",
    label: "Restaurant",
    defaultLayoutFamily: "hospitality",
    allowedLayoutFamilies: ["hospitality", "classic-stack"],
    defaultStructureTemplateId: "restaurant-bistro",
    forbiddenStructureTemplateIds: [
      "law-firm-authority",
      "finance-ledger-pro",
      "saas-starter",
      "portfolio-showcase",
    ],
    forbiddenPremiumTemplateIds: ["law", "finance", "saas"],
    defaultVisualThemeId: "luxury",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "tourism",
    label: "Tourism",
    aliases: ["travel"],
    defaultLayoutFamily: "hospitality",
    allowedLayoutFamilies: ["hospitality", "classic-stack"],
    defaultStructureTemplateId: "travel-horizon",
    forbiddenStructureTemplateIds: [
      "law-firm-authority",
      "dental-smile",
      "manufacturing-precision",
    ],
    defaultVisualThemeId: "luxury",
    editorialLayoutAllowed: false,
  }),
  industryExtend({
    id: "hotel",
    label: "Hotel",
    extends: "tourism",
    overrides: { defaultStructureTemplateId: "hotel-sanctuary" },
  }),
  industryExtend({
    id: "cafe",
    label: "Cafe",
    extends: "restaurant",
    overrides: {
      defaultStructureTemplateId: "cafe-artisan",
      forbiddenPremiumTemplateIds: ["law", "finance"],
    },
  }),
  industry({
    id: "law",
    label: "Law Firm",
    aliases: ["law-firm", "legal"],
    defaultLayoutFamily: "corporate-trust",
    allowedLayoutFamilies: ["corporate-trust", "classic-stack"],
    defaultStructureTemplateId: "law-firm-authority",
    forbiddenStructureTemplateIds: [
      "ecommerce-atelier",
      "fashion-runway",
      "travel-horizon",
      "restaurant-bistro",
      "fitness-pulse",
    ],
    forbiddenPremiumTemplateIds: ["ecommerce", "fashion", "travel"],
    defaultVisualThemeId: "corporate",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "finance",
    label: "Finance",
    extends: "law",
    overrides: {
      defaultStructureTemplateId: "finance-ledger-pro",
      forbiddenPremiumTemplateIds: ["ecommerce", "fashion", "travel", "restaurant"],
    },
  }),
  industry({
    id: "insurance",
    label: "Insurance",
    extends: "law",
    overrides: { defaultStructureTemplateId: "insurance-shield" },
  }),
  industry({
    id: "clinic",
    label: "Healthcare Clinic",
    aliases: ["medical", "healthcare", "health"],
    defaultLayoutFamily: "corporate-trust",
    allowedLayoutFamilies: ["corporate-trust", "classic-stack"],
    defaultStructureTemplateId: "medical-care-plus",
    forbiddenStructureTemplateIds: [
      "fashion-runway",
      "ecommerce-atelier",
      "travel-horizon",
    ],
    forbiddenPremiumTemplateIds: ["ecommerce", "fashion", "travel"],
    defaultVisualThemeId: "corporate",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "dental",
    label: "Dental",
    extends: "clinic",
    overrides: { defaultStructureTemplateId: "dental-smile" },
  }),
  industry({
    id: "saas",
    label: "SaaS",
    defaultLayoutFamily: "product-saas",
    allowedLayoutFamilies: ["product-saas", "classic-stack"],
    defaultStructureTemplateId: "saas-starter",
    defaultVisualThemeId: "bold",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "technology",
    label: "Technology",
    aliases: ["tech"],
    extends: "saas",
    overrides: {
      defaultStructureTemplateId: "ai-startup-signal",
      defaultVisualThemeId: "technology",
    },
  }),
  industry({
    id: "agency",
    label: "Creative Agency",
    defaultLayoutFamily: "editorial-magazine",
    allowedLayoutFamilies: ["editorial-magazine", "classic-stack"],
    defaultStructureTemplateId: "agency-portfolio",
    defaultVisualThemeId: "creative",
    editorialLayoutAllowed: true,
  }),
  industry({
    id: "blog",
    label: "Blog / Media",
    aliases: ["media", "magazine", "publishing", "journalism"],
    extends: "agency",
    overrides: {
      defaultStructureTemplateId: "portfolio-showcase",
      defaultVisualThemeId: "editorial",
    },
  }),
  industry({
    id: "fashion",
    label: "Fashion",
    defaultLayoutFamily: "editorial-magazine",
    allowedLayoutFamilies: [
      "editorial-magazine",
      "commerce-grid",
      "classic-stack",
    ],
    defaultStructureTemplateId: "fashion-runway",
    defaultVisualThemeId: "editorial",
    editorialLayoutAllowed: true,
  }),
  industry({
    id: "automotive",
    label: "Automotive",
    defaultLayoutFamily: "showroom",
    allowedLayoutFamilies: ["showroom", "classic-stack"],
    defaultStructureTemplateId: "automotive-showroom",
    defaultVisualThemeId: "luxury",
    premiumVisualThemesWhenLuxury: ["luxury"],
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "real-estate",
    label: "Real Estate",
    aliases: ["realestate", "property"],
    defaultLayoutFamily: "showroom",
    allowedLayoutFamilies: ["showroom", "classic-stack"],
    defaultStructureTemplateId: "real-estate-listings",
    defaultVisualThemeId: "modern",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "education",
    label: "Education",
    defaultLayoutFamily: "classic-stack",
    allowedLayoutFamilies: ["classic-stack", "corporate-trust"],
    defaultStructureTemplateId: "education-academy",
    defaultVisualThemeId: "corporate",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "business",
    label: "General Business",
    aliases: ["corporate", "company"],
    defaultLayoutFamily: "corporate-trust",
    allowedLayoutFamilies: ["corporate-trust", "classic-stack", "product-saas"],
    defaultStructureTemplateId: "modern-business",
    defaultVisualThemeId: "corporate",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "landing-page",
    label: "Landing Page",
    aliases: ["startup", "campaign"],
    extends: "saas",
    overrides: { defaultStructureTemplateId: "saas-starter" },
  }),
  industry({
    id: "beauty",
    label: "Beauty",
    defaultLayoutFamily: "commerce-grid",
    allowedLayoutFamilies: ["commerce-grid", "classic-stack"],
    defaultStructureTemplateId: "beauty-glow",
    defaultVisualThemeId: "luxury",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "fitness",
    label: "Fitness",
    defaultLayoutFamily: "classic-stack",
    allowedLayoutFamilies: ["classic-stack", "corporate-trust"],
    defaultStructureTemplateId: "fitness-pulse",
    defaultVisualThemeId: "bold",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "construction",
    label: "Construction",
    defaultLayoutFamily: "corporate-trust",
    allowedLayoutFamilies: ["corporate-trust", "classic-stack"],
    defaultStructureTemplateId: "construction-build",
    defaultVisualThemeId: "corporate",
    editorialLayoutAllowed: false,
  }),
  industry({
    id: "nonprofit",
    label: "Nonprofit",
    defaultLayoutFamily: "classic-stack",
    allowedLayoutFamilies: ["classic-stack", "corporate-trust"],
    defaultStructureTemplateId: "nonprofit-impact",
    defaultVisualThemeId: "modern",
    editorialLayoutAllowed: false,
  }),
];

export const DEFAULT_INDUSTRY_ID = "business";
export const DEFAULT_STRUCTURE_TEMPLATE_ID = "modern-business";

export function layoutFamilies(): LayoutFamilyKnowledgeEntry[] {
  return ARCHITECTURE_KNOWLEDGE_ENTRIES.filter(
    (e): e is LayoutFamilyKnowledgeEntry => e.kind === "layout-family",
  );
}

export function layoutTaxonomy(): LayoutTaxonomyKnowledgeEntry {
  return ARCHITECTURE_KNOWLEDGE_ENTRIES.find(
    (e): e is LayoutTaxonomyKnowledgeEntry => e.id === "layout-taxonomy-global",
  )!;
}

export function validationPolicy(): ValidationPolicyKnowledgeEntry {
  return ARCHITECTURE_KNOWLEDGE_ENTRIES.find(
    (e): e is ValidationPolicyKnowledgeEntry =>
      e.id === "validation-policy-default",
  )!;
}

export function businessRules(): BusinessRulesKnowledgeEntry {
  return ARCHITECTURE_KNOWLEDGE_ENTRIES.find(
    (e): e is BusinessRulesKnowledgeEntry =>
      e.id === "business-rules-default",
  )!;
}

export function styleRoutingPolicy(): StyleRoutingPolicyKnowledgeEntry {
  return ARCHITECTURE_KNOWLEDGE_ENTRIES.find(
    (e): e is StyleRoutingPolicyKnowledgeEntry =>
      e.id === "style-routing-policy-global",
  )!;
}
