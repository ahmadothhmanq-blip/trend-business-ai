import { booleanSchema, stringArraySchema } from "@/plugins/website/schemas";

export const businessProfileSchema = {
  type: "object",
  properties: {
    projectName: { type: "string" },
    industry: { type: "string" },
    targetAudience: { type: "string" },
    businessGoals: stringArraySchema,
    offer: { type: "string" },
    tone: { type: "string" },
    geography: { type: "string" },
    competitors: stringArraySchema,
    kpis: stringArraySchema,
    summary: { type: "string" },
  },
  required: [
    "projectName",
    "industry",
    "targetAudience",
    "businessGoals",
    "offer",
    "tone",
    "geography",
    "competitors",
    "kpis",
    "summary",
  ],
};

export const businessIdeaAnalysisSchema = {
  type: "object",
  properties: {
    projectName: { type: "string" },
    projectType: { type: "string" },
    pages: stringArraySchema,
    features: stringArraySchema,
    designSystem: stringArraySchema,
    technologies: stringArraySchema,
    requiresAuth: booleanSchema,
    requiresDatabase: booleanSchema,
    requiresDashboard: booleanSchema,
    isEcommerce: booleanSchema,
    isSaas: booleanSchema,
    databaseProvider: { type: "string" },
    businessProfile: businessProfileSchema,
  },
  required: [
    "projectName",
    "projectType",
    "pages",
    "features",
    "designSystem",
    "technologies",
    "requiresAuth",
    "requiresDatabase",
    "requiresDashboard",
    "isEcommerce",
    "isSaas",
    "databaseProvider",
    "businessProfile",
  ],
};

export const websiteStrategySchema = {
  type: "object",
  properties: {
    positioning: { type: "string" },
    sitemap: stringArraySchema,
    pages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          path: { type: "string" },
          purpose: { type: "string" },
          keySections: stringArraySchema,
          primaryCta: { type: "string" },
        },
        required: ["name", "path", "purpose", "keySections"],
      },
    },
    sectionPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          page: { type: "string" },
          name: { type: "string" },
          goal: { type: "string" },
          contentNotes: { type: "string" },
        },
        required: ["id", "page", "name", "goal", "contentNotes"],
      },
    },
    conversionFunnel: stringArraySchema,
    contentStructure: stringArraySchema,
    ctas: stringArraySchema,
    seoFocus: stringArraySchema,
  },
  required: [
    "positioning",
    "sitemap",
    "pages",
    "sectionPlan",
    "conversionFunnel",
    "contentStructure",
    "ctas",
    "seoFocus",
  ],
};

export const designSystemSchema = {
  type: "object",
  properties: {
    style: { type: "string" },
    industryPattern: { type: "string" },
    colors: {
      type: "object",
      properties: {
        primary: { type: "string" },
        secondary: { type: "string" },
        accent: { type: "string" },
        neutral: { type: "string" },
        surface: { type: "string" },
        background: { type: "string" },
        foreground: { type: "string" },
      },
      required: [
        "primary",
        "secondary",
        "accent",
        "neutral",
        "surface",
        "background",
        "foreground",
      ],
    },
    typography: {
      type: "object",
      properties: {
        headingFont: { type: "string" },
        bodyFont: { type: "string" },
        scale: stringArraySchema,
        notes: { type: "string" },
      },
      required: ["headingFont", "bodyFont", "scale", "notes"],
    },
    layoutRules: stringArraySchema,
    componentPalette: stringArraySchema,
    spacingScale: stringArraySchema,
    borderRadius: { type: "string" },
    shadowStyle: { type: "string" },
  },
  required: [
    "style",
    "industryPattern",
    "colors",
    "typography",
    "layoutRules",
    "componentPalette",
    "spacingScale",
    "borderRadius",
    "shadowStyle",
  ],
};

export const assetPlanSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          role: { type: "string" },
          name: { type: "string" },
          prompt: { type: "string" },
          alt: { type: "string" },
        },
        required: ["id", "role", "name", "prompt", "alt"],
      },
    },
  },
  required: ["items"],
};
