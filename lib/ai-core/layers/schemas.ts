/**
 * JSON-schema style descriptors for Core layer artifacts.
 * Compatible with provider generateJson schema validation patterns used elsewhere.
 */

const stringArray = {
  type: "array",
  items: { type: "string" },
} as const;

export const coreBusinessProfileSchema = {
  type: "object",
  properties: {
    projectName: { type: "string" },
    industry: { type: "string" },
    targetAudience: { type: "string" },
    businessGoals: stringArray,
    offer: { type: "string" },
    tone: { type: "string" },
    geography: { type: "string" },
    competitors: stringArray,
    kpis: stringArray,
    summary: { type: "string" },
    requiredSections: stringArray,
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
    "requiredSections",
  ],
} as const;

export const coreProductStrategySchema = {
  type: "object",
  properties: {
    positioning: { type: "string" },
    sitemap: stringArray,
    pages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          path: { type: "string" },
          purpose: { type: "string" },
          keySections: stringArray,
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
    conversionFunnel: stringArray,
    contentStructure: stringArray,
    contentStrategy: {
      type: "object",
      properties: {
        brandVoice: { type: "string" },
        messagingPillars: stringArray,
        proofPoints: stringArray,
        objectionHandlers: stringArray,
        seoTopics: stringArray,
      },
      required: [
        "brandVoice",
        "messagingPillars",
        "proofPoints",
        "objectionHandlers",
        "seoTopics",
      ],
    },
    ctas: stringArray,
    seoFocus: stringArray,
  },
  required: [
    "positioning",
    "sitemap",
    "pages",
    "sectionPlan",
    "conversionFunnel",
    "contentStructure",
    "contentStrategy",
    "ctas",
    "seoFocus",
  ],
} as const;

export const coreDesignSystemSchema = {
  type: "object",
  properties: {
    style: { type: "string" },
    stylePreset: { type: "string" },
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
        scale: stringArray,
        notes: { type: "string" },
      },
      required: ["headingFont", "bodyFont", "scale", "notes"],
    },
    layoutRules: stringArray,
    layoutStyle: { type: "string" },
    uiPatterns: stringArray,
    componentPalette: stringArray,
    spacingScale: stringArray,
    borderRadius: { type: "string" },
    shadowStyle: { type: "string" },
  },
  required: [
    "style",
    "stylePreset",
    "industryPattern",
    "colors",
    "typography",
    "layoutRules",
    "layoutStyle",
    "uiPatterns",
    "componentPalette",
    "spacingScale",
    "borderRadius",
    "shadowStyle",
  ],
} as const;

export const coreAssetManifestSchema = {
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
          url: { type: ["string", "null"] },
          storagePath: { type: ["string", "null"] },
          status: { type: "string" },
          mimeType: { type: "string" },
        },
        required: ["id", "role", "name", "prompt", "alt", "status"],
      },
    },
    provider: { type: "string" },
    generatedAt: { type: "string" },
  },
  required: ["items"],
} as const;

export const coreQualityReportSchema = {
  type: "object",
  properties: {
    passed: { type: "boolean" },
    dimensions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          passed: { type: "boolean" },
          issues: stringArray,
        },
        required: ["name", "passed", "issues"],
      },
    },
    weakSections: stringArray,
    improveApplied: { type: "boolean" },
    improveNotes: stringArray,
    issues: stringArray,
    score: { type: "number" },
    publishReady: { type: "boolean" },
    seoReadinessScore: { type: "number" },
    performanceScore: { type: "number" },
    designConsistencyPassed: { type: "boolean" },
  },
  required: ["passed", "dimensions", "weakSections", "improveApplied", "issues"],
} as const;

export const coreSeoPackageSchema = {
  type: "object",
  properties: {
    metadata: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        keywords: stringArray,
        canonicalPath: { type: "string" },
        robots: { type: "string" },
      },
      required: ["title", "description", "keywords", "canonicalPath", "robots"],
    },
    openGraph: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        type: { type: "string" },
        siteName: { type: "string" },
        locale: { type: "string" },
        imageAlt: { type: "string" },
        imagePath: { type: "string" },
      },
      required: ["title", "description", "type", "siteName", "locale", "imageAlt"],
    },
    twitter: {
      type: "object",
      properties: {
        card: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        imageAlt: { type: "string" },
      },
      required: ["card", "title", "description", "imageAlt"],
    },
    keywords: stringArray,
    structuredData: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          jsonLd: { type: "object" },
        },
        required: ["type", "jsonLd"],
      },
    },
    sitemap: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          priority: { type: "number" },
          changefreq: { type: "string" },
        },
        required: ["path", "priority", "changefreq"],
      },
    },
    readiness: {
      type: "object",
      properties: {
        passed: { type: "boolean" },
        score: { type: "number" },
        issues: stringArray,
        recommendations: stringArray,
      },
      required: ["passed", "score", "issues"],
    },
    generatedAt: { type: "string" },
  },
  required: [
    "metadata",
    "openGraph",
    "keywords",
    "structuredData",
    "sitemap",
    "readiness",
    "generatedAt",
  ],
} as const;

export const corePerformanceReportSchema = {
  type: "object",
  properties: {
    passed: { type: "boolean" },
    score: { type: "number" },
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          passed: { type: "boolean" },
          score: { type: "number" },
          issues: stringArray,
          recommendations: stringArray,
        },
        required: ["name", "passed", "score", "issues", "recommendations"],
      },
    },
    issues: stringArray,
    recommendations: stringArray,
    generatedAt: { type: "string" },
  },
  required: ["passed", "score", "checks", "issues", "recommendations", "generatedAt"],
} as const;
