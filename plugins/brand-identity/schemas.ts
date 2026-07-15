const stringArray = { type: "array", items: { type: "string" } };

export const brandAnalysisSchema = {
  type: "object",
  properties: {
    brandName: { type: "string" },
    industry: { type: "string" },
    positioning: { type: "string" },
    targetAudience: { type: "string" },
    competitors: stringArray,
    differentiators: stringArray,
    personality: { type: "string" },
    coreValues: stringArray,
    emotionalAppeal: { type: "string" },
  },
  required: ["brandName", "industry", "positioning", "targetAudience", "competitors", "differentiators", "personality", "coreValues", "emotionalAppeal"],
};

export const brandPlanSchema = {
  type: "object",
  properties: {
    mission: { type: "string" },
    vision: { type: "string" },
    values: stringArray,
    voiceTone: {
      type: "object",
      properties: {
        tone: { type: "string" },
        doExamples: stringArray,
        dontExamples: stringArray,
        tagline: { type: "string" },
        elevatorPitch: { type: "string" },
      },
      required: ["tone", "doExamples", "dontExamples", "tagline", "elevatorPitch"],
    },
    colorPalette: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          hex: { type: "string" },
          role: { type: "string" },
          usage: { type: "string" },
        },
        required: ["name", "hex", "role", "usage"],
      },
    },
    typography: {
      type: "object",
      properties: {
        primary: { type: "string" },
        secondary: { type: "string" },
        weight: { type: "string" },
        headingStyle: { type: "string" },
        bodyStyle: { type: "string" },
        notes: { type: "string" },
      },
      required: ["primary", "secondary", "weight", "headingStyle", "bodyStyle", "notes"],
    },
    deliverables: stringArray,
    brandArchetype: { type: "string" },
  },
  required: ["mission", "vision", "values", "voiceTone", "colorPalette", "typography", "deliverables", "brandArchetype"],
};

export const brandAssetSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    category: { type: "string" },
    description: { type: "string" },
    content: { type: "string" },
    format: { type: "string" },
  },
  required: ["name", "category", "description", "content", "format"],
};
