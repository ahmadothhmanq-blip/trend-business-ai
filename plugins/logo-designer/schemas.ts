const stringArraySchema = { type: "array", items: { type: "string" } };

export const logoAnalysisSchema = {
  type: "object",
  properties: {
    brandName: { type: "string" },
    industry: { type: "string" },
    style: { type: "string" },
    mood: { type: "string" },
    personality: { type: "string" },
    colorDirection: { type: "string" },
    typographyDirection: { type: "string" },
    conceptSuggestions: stringArraySchema,
    targetAudience: { type: "string" },
    brandValues: stringArraySchema,
  },
  required: ["brandName", "industry", "style", "mood", "personality", "colorDirection", "typographyDirection", "conceptSuggestions", "targetAudience", "brandValues"],
};

export const logoPlanSchema = {
  type: "object",
  properties: {
    concepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          approach: { type: "string" },
          iconDescription: { type: "string" },
          layoutDescription: { type: "string" },
          colorUsage: { type: "string" },
        },
        required: ["name", "description", "approach", "iconDescription", "layoutDescription", "colorUsage"],
      },
    },
    colorPalette: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          hex: { type: "string" },
          role: { type: "string" },
        },
        required: ["name", "hex", "role"],
      },
    },
    typography: {
      type: "object",
      properties: {
        primary: { type: "string" },
        secondary: { type: "string" },
        weight: { type: "string" },
      },
      required: ["primary", "secondary", "weight"],
    },
    deliverables: stringArraySchema,
    svgApproach: { type: "string" },
  },
  required: ["concepts", "colorPalette", "typography", "deliverables", "svgApproach"],
};

export const logoConceptSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    svgCode: { type: "string" },
  },
  required: ["name", "description", "svgCode"],
};

export const logoVariationSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    useCase: { type: "string" },
    svgCode: { type: "string" },
  },
  required: ["name", "description", "useCase", "svgCode"],
};
