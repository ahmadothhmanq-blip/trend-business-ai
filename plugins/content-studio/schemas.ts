const stringArray = { type: "array", items: { type: "string" } };

export const contentAnalysisSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    contentType: { type: "string" },
    targetAudience: { type: "string" },
    mainMessage: { type: "string" },
    keyPoints: stringArray,
    suggestedStructure: { type: "string" },
    toneAnalysis: { type: "string" },
    competitiveAngle: { type: "string" },
  },
  required: ["title", "contentType", "targetAudience", "mainMessage", "keyPoints", "suggestedStructure", "toneAnalysis", "competitiveAngle"],
};

export const contentPlanSchema = {
  type: "object",
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          purpose: { type: "string" },
          wordCount: { type: "number" },
          keyPoints: stringArray,
        },
        required: ["heading", "purpose", "wordCount", "keyPoints"],
      },
    },
    totalWordCount: { type: "number" },
    seoStrategy: { type: "string" },
    primaryKeyword: { type: "string" },
    secondaryKeywords: stringArray,
    headlineVariants: stringArray,
  },
  required: ["sections", "totalWordCount", "seoStrategy", "primaryKeyword", "secondaryKeywords", "headlineVariants"],
};

export const contentSeoSchema = {
  type: "object",
  properties: {
    score: { type: "number" },
    keywordDensity: { type: "object" },
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    headingStructure: stringArray,
    internalLinkingSuggestions: stringArray,
    faqItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
    },
    schemaSuggestions: stringArray,
    readabilityScore: { type: "number" },
    wordCount: { type: "number" },
  },
  required: ["score", "keywordDensity", "metaTitle", "metaDescription", "headingStructure", "internalLinkingSuggestions", "faqItems", "schemaSuggestions", "readabilityScore", "wordCount"],
};

export const contentHeadlinesSchema = {
  type: "object",
  properties: {
    headlines: stringArray,
  },
  required: ["headlines"],
};

export const contentImprovementsSchema = {
  type: "object",
  properties: {
    suggestions: stringArray,
    improvements: stringArray,
  },
  required: ["suggestions", "improvements"],
};
