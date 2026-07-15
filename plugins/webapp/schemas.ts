const stringArraySchema = {
  type: "array",
  items: { type: "string" },
};

const booleanSchema = { type: "boolean" };

export const webappAnalysisSchema = {
  type: "object",
  properties: {
    appName: { type: "string" },
    appType: { type: "string" },
    complexity: { type: "string" },
    pages: stringArraySchema,
    features: stringArraySchema,
    technologies: stringArraySchema,
    databaseTables: stringArraySchema,
    apiEndpoints: stringArraySchema,
    requiresAuth: booleanSchema,
    requiresDatabase: booleanSchema,
    requiresDashboard: booleanSchema,
    isEcommerce: booleanSchema,
    isSaas: booleanSchema,
    databaseProvider: { type: "string" },
  },
  required: [
    "appName",
    "appType",
    "complexity",
    "pages",
    "features",
    "technologies",
    "databaseTables",
    "apiEndpoints",
    "requiresAuth",
    "requiresDatabase",
    "requiresDashboard",
    "isEcommerce",
    "isSaas",
    "databaseProvider",
  ],
};

export const webappBlueprintSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    pages: stringArraySchema,
    sections: stringArraySchema,
    dataModels: stringArraySchema,
    apiRoutes: stringArraySchema,
    components: stringArraySchema,
    navigation: stringArraySchema,
    theme: stringArraySchema,
    roadmap: stringArraySchema,
  },
  required: [
    "title",
    "description",
    "pages",
    "sections",
    "dataModels",
    "apiRoutes",
    "components",
    "navigation",
    "theme",
    "roadmap",
  ],
};

export const webappDynamicPlanSchema = {
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

export const webappGeneratedFileSchema = {
  type: "object",
  properties: {
    path: { type: "string" },
    content: { type: "string" },
    language: { type: "string" },
  },
  required: ["path", "content", "language"],
};
