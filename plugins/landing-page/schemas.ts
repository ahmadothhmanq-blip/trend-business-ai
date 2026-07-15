const stringArraySchema = { type: "array", items: { type: "string" } };
const booleanSchema = { type: "boolean" };

export const lpAnalysisSchema = {
  type: "object",
  properties: {
    pageName: { type: "string" },
    pageType: { type: "string" },
    sections: stringArraySchema,
    features: stringArraySchema,
    technologies: stringArraySchema,
    requiresAuth: booleanSchema,
    requiresDatabase: booleanSchema,
    requiresDashboard: booleanSchema,
    isEcommerce: booleanSchema,
    isSaas: booleanSchema,
    databaseProvider: { type: "string" },
  },
  required: [
    "pageName", "pageType", "sections", "features", "technologies",
    "requiresAuth", "requiresDatabase", "requiresDashboard",
    "isEcommerce", "isSaas", "databaseProvider",
  ],
};

export const lpBlueprintSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    headline: { type: "string" },
    subheadline: { type: "string" },
    sections: stringArraySchema,
    colorPalette: stringArraySchema,
    typography: stringArraySchema,
    components: stringArraySchema,
    content: stringArraySchema,
    seo: stringArraySchema,
  },
  required: [
    "title", "description", "headline", "subheadline", "sections",
    "colorPalette", "typography", "components", "content", "seo",
  ],
};

export const lpDynamicPlanSchema = {
  type: "object",
  properties: {
    complexity: { type: "string" },
    estimatedFileCount: { type: "number" },
    layouts: stringArraySchema,
    pages: stringArraySchema,
    components: stringArraySchema,
    apiRoutes: stringArraySchema,
    hooks: stringArraySchema,
    utilities: stringArraySchema,
    types: stringArraySchema,
    configs: stringArraySchema,
    files: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          purpose: { type: "string" },
          language: { type: "string" },
          category: { type: "string" },
        },
        required: ["path", "purpose", "language", "category"],
      },
    },
  },
  required: [
    "complexity", "estimatedFileCount", "layouts", "pages", "components",
    "apiRoutes", "hooks", "utilities", "types", "configs", "files",
  ],
};

export const lpGeneratedFileSchema = {
  type: "object",
  properties: {
    path: { type: "string" },
    content: { type: "string" },
    language: { type: "string" },
  },
  required: ["path", "content", "language"],
};
