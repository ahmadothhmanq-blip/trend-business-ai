export const stringArraySchema = {
  type: "array",
  items: { type: "string" },
};

export const booleanSchema = { type: "boolean" };

export const websiteAnalysisSchema = {
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
  ],
};

export const websiteBlueprintSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    pages: stringArraySchema,
    sections: stringArraySchema,
    colorPalette: stringArraySchema,
    typography: stringArraySchema,
    components: stringArraySchema,
    content: stringArraySchema,
    seo: stringArraySchema,
    roadmap: stringArraySchema,
  },
  required: [
    "title",
    "description",
    "pages",
    "sections",
    "colorPalette",
    "typography",
    "components",
    "content",
    "seo",
    "roadmap",
  ],
};

export const websiteDynamicPlanSchema = {
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
    "complexity",
    "estimatedFileCount",
    "layouts",
    "pages",
    "components",
    "apiRoutes",
    "hooks",
    "utilities",
    "types",
    "configs",
    "files",
  ],
};

export const generatedFileSchema = {
  type: "object",
  properties: {
    path: { type: "string" },
    content: { type: "string" },
    language: { type: "string" },
  },
  required: ["path", "content", "language"],
};
