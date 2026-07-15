export type BusinessGenerationStatus = "pending" | "generating" | "completed" | "failed";
export type BusinessGenerationMode = "generate" | "regenerate" | "update" | "expand";

export type BusinessScorecard = {
  overall: number;
  viability: number;
  marketFit: number;
  financialHealth: number;
  competitivePosition: number;
  growthPotential: number;
  riskLevel: number;
};

export type BusinessRisk = {
  category: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  mitigation: string;
};

export type BusinessOpportunity = {
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  timeframe: string;
  actionRequired: string;
};

export type BusinessActionItem = {
  action: string;
  priority: "low" | "medium" | "high" | "urgent";
  owner: string;
  deadline: string;
  status: string;
};

export type BusinessBlueprint = {
  title: string;
  businessTool: string;
  businessType: string;
  executiveSummary: string;
  body: string;
  sections: { heading: string; content: string }[];
  scorecard: BusinessScorecard | null;
  risks: BusinessRisk[];
  opportunities: BusinessOpportunity[];
  actionPlan: BusinessActionItem[];
  recommendations: string[];
  improvements: string[];
  files: { path: string; content: string; language: string }[];
  prompt: string;
  industry: string;
  companyStage: string;
  targetMarket: string;
  generatedAt: string;
  progressEvents?: string[];
};

export type BusinessGeneration = {
  id: string;
  user_id: string;
  title: string;
  business_tool: string;
  business_type: string;
  description: string;
  prompt: string;
  industry: string;
  company_stage: string;
  target_market: string;
  options: string[];
  blueprint: BusinessBlueprint | null;
  status: BusinessGenerationStatus;
  mode: BusinessGenerationMode;
  provider: string | null;
  token_usage: Record<string, number> | null;
  generation_time_ms: number | null;
  parent_generation_id: string | null;
  project_id: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};
