export type BusinessPluginInput = {
  prompt: string;
  businessTool: string;
  businessType: string;
  industry: string;
  companyStage: string;
  targetMarket: string;
  options: string[];
};

export type BusinessAnalysis = {
  title: string;
  businessContext: string;
  industryInsights: string;
  mainChallenges: string[];
  keyQuestions: string[];
  analysisScope: string;
  urgencyLevel: string;
};

export type BusinessSection = {
  heading: string;
  purpose: string;
  keyPoints: string[];
};

export type BusinessPlanResult = {
  sections: BusinessSection[];
  scorecardMetrics: string[];
  riskCategories: string[];
  opportunityAreas: string[];
};

export type BusinessScorecardResult = {
  overall: number;
  viability: number;
  marketFit: number;
  financialHealth: number;
  competitivePosition: number;
  growthPotential: number;
  riskLevel: number;
};

export type BusinessRiskResult = {
  category: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  mitigation: string;
};

export type BusinessOpportunityResult = {
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  timeframe: string;
  actionRequired: string;
};

export type BusinessActionItemResult = {
  action: string;
  priority: "low" | "medium" | "high" | "urgent";
  owner: string;
  deadline: string;
  status: string;
};

export type BusinessOutput = {
  title: string;
  businessTool: string;
  businessType: string;
  executiveSummary: string;
  body: string;
  sections: { heading: string; content: string }[];
  scorecard: BusinessScorecardResult | null;
  risks: BusinessRiskResult[];
  opportunities: BusinessOpportunityResult[];
  actionPlan: BusinessActionItemResult[];
  recommendations: string[];
  improvements: string[];
  files: { path: string; content: string; language: string }[];
};
