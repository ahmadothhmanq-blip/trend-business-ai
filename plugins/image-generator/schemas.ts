const stringArray = { type: "array", items: { type: "string" } };

export const imageAnalysisSchema = {
  type: "object",
  properties: {
    subject: { type: "string" },
    imageType: { type: "string" },
    style: { type: "string" },
    mood: { type: "string" },
    colorDirection: { type: "string" },
    compositionNotes: { type: "string" },
    targetUse: { type: "string" },
    technicalRequirements: stringArray,
  },
  required: ["subject", "imageType", "style", "mood", "colorDirection", "compositionNotes", "targetUse", "technicalRequirements"],
};

export const imagePlanSchema = {
  type: "object",
  properties: {
    concepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          compositionNotes: { type: "string" },
          colorPalette: stringArray,
          lightingDirection: { type: "string" },
        },
        required: ["name", "description", "compositionNotes", "colorPalette", "lightingDirection"],
      },
    },
    colorDirection: { type: "string" },
    moodBoard: stringArray,
    outputFormats: stringArray,
    compositionApproach: { type: "string" },
  },
  required: ["concepts", "colorDirection", "moodBoard", "outputFormats", "compositionApproach"],
};

export const imageConceptSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    prompt: { type: "string" },
    negativePrompt: { type: "string" },
    aspectRatio: { type: "string" },
    style: { type: "string" },
    svgConcept: { type: "string" },
  },
  required: ["name", "description", "prompt", "negativePrompt", "aspectRatio", "style", "svgConcept"],
};

export const imagePromptLibrarySchema = {
  type: "object",
  properties: {
    prompts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          prompt: { type: "string" },
          negativePrompt: { type: "string" },
          style: { type: "string" },
        },
        required: ["name", "prompt", "negativePrompt", "style"],
      },
    },
  },
  required: ["prompts"],
};
