/**
 * AI Search Center types — AEO + GEO + SEO visibility platform.
 */

export type AiSearchScoreGrade = "A" | "B" | "C" | "D" | "F";

export type AiSearchCheckStatus = "pass" | "warn" | "fail";

export type AiSearchIssueSeverity = "critical" | "warning" | "info";

export type AiSearchIssue = {
  id: string;
  severity: AiSearchIssueSeverity;
  message: string;
  recommendation: string;
};

export type AiSearchCheck = {
  id: string;
  label: string;
  status: AiSearchCheckStatus;
  detail: string;
  scoreImpact?: number;
};

export type AiSearchScoreBreakdown = {
  overall: number;
  seo: number;
  aeo: number;
  geo: number;
  technical: number;
  contentQuality: number;
  structuredData: number;
  grade: AiSearchScoreGrade;
};

export type AiVisibilityDashboard = {
  generatedAt: string;
  siteUrl: string;
  isProduction: boolean;
  scores: AiSearchScoreBreakdown;
  checks: AiSearchCheck[];
  engineCoverage: Array<{
    engine: string;
    readiness: number;
    status: AiSearchCheckStatus;
    notes: string;
  }>;
  counts: {
    publicRoutes: number;
    sitemapUrls: number;
    products: number;
    programmaticPublished: number;
    programmaticDraft: number;
    industries: number;
    countries: number;
    cities: number;
    knowledgePublished: number;
    knowledgeDraft: number;
    faqItems: number;
    schemaTypesAvailable: number;
  };
};

export type AeoAnalyzeResult = {
  score: number;
  grade: AiSearchScoreGrade;
  issues: AiSearchIssue[];
  strengths: string[];
  metrics: {
    questionCount: number;
    answerFirstDetected: boolean;
    faqQuality: number;
    headingDepth: number;
    readabilityScore: number;
    internalLinkCount: number;
    directAnswerDensity: number;
  };
  recommendations: string[];
  aiInsights?: string;
  source: "rules" | "rules+ai";
};

export type GeoAnalyzeResult = {
  score: number;
  grade: AiSearchScoreGrade;
  issues: AiSearchIssue[];
  strengths: string[];
  metrics: {
    entityCoverage: number;
    semanticRelevance: number;
    brandMentions: number;
    topicClusterStrength: number;
    citationReadiness: number;
    aiDiscoverability: number;
  };
  entitiesDetected: string[];
  topicClusters: string[];
  recommendations: string[];
  aiInsights?: string;
  source: "rules" | "rules+ai";
};

export type SchemaValidationIssue = {
  type: string;
  severity: AiSearchIssueSeverity;
  field?: string;
  message: string;
  recommendation: string;
};

export type SchemaValidationResult = {
  score: number;
  grade: AiSearchScoreGrade;
  platformCoverage: Array<{
    type: string;
    available: boolean;
    usedOnSite: boolean;
    status: AiSearchCheckStatus;
    detail: string;
  }>;
  pageIssues: SchemaValidationIssue[];
  warnings: string[];
  errors: string[];
  recommendations: string[];
};

export type ContentOptimizeResult = {
  title: string;
  metaDescription: string;
  openGraph: {
    title: string;
    description: string;
    type: string;
  };
  faq: Array<{ question: string; answer: string }>;
  schema: Record<string, unknown>;
  aiSummary: string;
  callToAction: string;
  internalLinks: Array<{ label: string; href: string; reason: string }>;
  source: "rules" | "rules+ai";
};

export type AiSearchAnalytics = {
  generatedAt: string;
  mostSearchedTopics: Array<{ topic: string; signal: number; sources: string[] }>;
  topPerformingPages: Array<{ path: string; title: string; score: number; reasons: string[] }>;
  aiReadyPages: Array<{ path: string; title: string; score: number }>;
  weakPages: Array<{ path: string; title: string; score: number; gaps: string[] }>;
  contentOpportunities: Array<{ id: string; title: string; cluster: string; priority: "high" | "medium" | "low" }>;
  keywordOpportunities: Array<{ keyword: string; intent: string; coverage: "covered" | "partial" | "missing" }>;
  searchTrends: Array<{ label: string; direction: "up" | "stable" | "opportunity"; detail: string }>;
};

export type ProgrammaticManagerInventory = {
  generatedAt: string;
  clusters: Array<{
    id: string;
    label: string;
    published: number;
    draft: number;
    paths: Array<{ path: string; title: string; status: "published" | "draft" }>;
  }>;
  duplicates: Array<{ path: string; conflictWith: string; reason: string }>;
  qualityGates: AiSearchCheck[];
  recommendations: string[];
};

export type KnowledgeManagerInventory = {
  generatedAt: string;
  hubs: Array<{ id: string; title: string; path: string }>;
  byKind: Record<string, { published: number; draft: number; entries: Array<{ id: string; title: string; path: string; status: string }> }>;
  gaps: Array<{ kind: string; message: string; priority: "high" | "medium" | "low" }>;
  recommendations: string[];
};

export type CompetitorIntelligenceReport = {
  generatedAt: string;
  ourCoverage: string[];
  competitors: Array<{
    name: string;
    category: string;
    strengths: string[];
    weaknesses: string[];
    overlap: string[];
    missingVsUs: string[];
    opportunities: string[];
  }>;
  platformGaps: string[];
  recommendations: string[];
};

export type AiSearchRecommendation = {
  id: string;
  category:
    | "pages"
    | "faq"
    | "schema"
    | "internal-links"
    | "keywords"
    | "content"
    | "ai-search";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  detail: string;
  actionHref?: string;
};

export type AiSearchDashboardPayload = {
  visibility: AiVisibilityDashboard;
  analytics: AiSearchAnalytics;
  programmatic: ProgrammaticManagerInventory;
  knowledge: KnowledgeManagerInventory;
  competitors: CompetitorIntelligenceReport;
  recommendations: AiSearchRecommendation[];
  readinessScore: number;
};
