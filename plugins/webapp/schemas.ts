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

/**
 * Single Stage-2 planning payload — replaces sequential analyze/blueprint/plan LLM calls.
 * Downstream code still consumes the split shapes (analysis / blueprint / filePlan).
 */
export const webappUnifiedPlanningSchema = {
  type: "object",
  properties: {
    analysis: webappAnalysisSchema,
    strategy: {
      type: "object",
      properties: {
        positioning: { type: "string" },
        pages: stringArraySchema,
        sections: stringArraySchema,
        ctas: stringArraySchema,
        seoFocus: stringArraySchema,
      },
      required: ["positioning", "pages", "sections", "ctas", "seoFocus"],
    },
    universalBlueprint: {
      type: "object",
      properties: {
        intentSummary: { type: "string" },
        goals: stringArraySchema,
        constraints: stringArraySchema,
        orderedServices: stringArraySchema,
        selectedServiceId: { type: "string" },
      },
      required: [
        "intentSummary",
        "goals",
        "constraints",
        "orderedServices",
        "selectedServiceId",
      ],
    },
    databaseSchema: {
      type: "object",
      properties: {
        provider: { type: "string" },
        tables: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              fields: stringArraySchema,
              relations: stringArraySchema,
            },
            required: ["name", "fields"],
          },
        },
      },
      required: ["provider", "tables"],
    },
    apiPlan: {
      type: "object",
      properties: {
        routes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              path: { type: "string" },
              methods: stringArraySchema,
              purpose: { type: "string" },
            },
            required: ["path", "methods", "purpose"],
          },
        },
      },
      required: ["routes"],
    },
    uiPlan: {
      type: "object",
      properties: {
        layouts: stringArraySchema,
        pages: stringArraySchema,
        components: stringArraySchema,
        navigation: stringArraySchema,
        theme: stringArraySchema,
      },
      required: ["layouts", "pages", "components", "navigation", "theme"],
    },
    filePlan: webappDynamicPlanSchema,
    servicePlan: {
      type: "object",
      properties: {
        services: stringArraySchema,
        integrations: stringArraySchema,
        authProvider: { type: "string" },
      },
      required: ["services", "integrations", "authProvider"],
    },
    dependencies: {
      type: "object",
      properties: {
        npm: stringArraySchema,
        devNpm: stringArraySchema,
      },
      required: ["npm", "devNpm"],
    },
    executionMetadata: {
      type: "object",
      properties: {
        complexity: { type: "string" },
        estimatedFileCount: { type: "number" },
        generationMode: { type: "string" },
        notes: stringArraySchema,
      },
      required: ["complexity", "estimatedFileCount", "generationMode"],
    },
    blueprint: webappBlueprintSchema,
  },
  required: [
    "analysis",
    "strategy",
    "universalBlueprint",
    "databaseSchema",
    "apiPlan",
    "uiPlan",
    "filePlan",
    "servicePlan",
    "dependencies",
    "executionMetadata",
    "blueprint",
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
