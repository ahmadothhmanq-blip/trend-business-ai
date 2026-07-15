const stringArray = { type: "array", items: { type: "string" } };

export const businessAnalysisSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    businessContext: { type: "string" },
    industryInsights: { type: "string" },
    mainChallenges: stringArray,
    keyQuestions: stringArray,
    analysisScope: { type: "string" },
    urgencyLevel: { type: "string" },
  },
  required: ["title", "businessContext", "industryInsights", "mainChallenges", "keyQuestions", "analysisScope", "urgencyLevel"],
};

export const businessPlanSchema = {
  type: "object",
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          purpose: { type: "string" },
          keyPoints: stringArray,
        },
        required: ["heading", "purpose", "keyPoints"],
      },
    },
    scorecardMetrics: stringArray,
    riskCategories: stringArray,
    opportunityAreas: stringArray,
  },
  required: ["sections", "scorecardMetrics", "riskCategories", "opportunityAreas"],
};

export const businessScorecardSchema = {
  type: "object",
  properties: {
    overall: { type: "number" },
    viability: { type: "number" },
    marketFit: { type: "number" },
    financialHealth: { type: "number" },
    competitivePosition: { type: "number" },
    growthPotential: { type: "number" },
    riskLevel: { type: "number" },
  },
  required: ["overall", "viability", "marketFit", "financialHealth", "competitivePosition", "growthPotential", "riskLevel"],
};

export const businessRisksSchema = {
  type: "object",
  properties: {
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          description: { type: "string" },
          severity: { type: "string" },
          mitigation: { type: "string" },
        },
        required: ["category", "description", "severity", "mitigation"],
      },
    },
    opportunities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          impact: { type: "string" },
          timeframe: { type: "string" },
          actionRequired: { type: "string" },
        },
        required: ["title", "description", "impact", "timeframe", "actionRequired"],
      },
    },
  },
  required: ["risks", "opportunities"],
};

export const businessActionPlanSchema = {
  type: "object",
  properties: {
    actionPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          priority: { type: "string" },
          owner: { type: "string" },
          deadline: { type: "string" },
          status: { type: "string" },
        },
        required: ["action", "priority", "owner", "deadline", "status"],
      },
    },
    recommendations: stringArray,
    improvements: stringArray,
  },
  required: ["actionPlan", "recommendations", "improvements"],
};
