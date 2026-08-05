import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  BusinessProfile,
  DesignSystem,
  WebsiteStrategy,
} from "@/lib/website/types";
import type {
  WQBS_BENCHMARK_MODES,
  WQBS_CATEGORIES,
  WQBS_REFERENCE_PLATFORMS,
} from "@/lib/website/quality-benchmark/constants";

export type WqbsBenchmarkMode = (typeof WQBS_BENCHMARK_MODES)[number];
export type WqbsCategory = (typeof WQBS_CATEGORIES)[number];
export type WqbsReferencePlatform = (typeof WQBS_REFERENCE_PLATFORMS)[number];

export type WqbsSubDimensionScore = {
  id: string;
  label: string;
  score: number;
  signals: string[];
  issues: string[];
};

export type WqbsCategoryEvaluation = {
  category: WqbsCategory;
  score: number;
  subDimensions: WqbsSubDimensionScore[];
};

export type WqbsCategoryScores = {
  overall: number;
  visualDesign: number;
  userExperience: number;
  business: number;
  seo: number;
  performance: number;
  accessibility: number;
  content: number;
  localization: number;
};

export type WqbsRecommendationPriority = "critical" | "high" | "medium" | "low";
export type WqbsEffortEstimate = "low" | "medium" | "high";
export type WqbsImpactEstimate = "low" | "medium" | "high";

export type WqbsRecommendation = {
  id: string;
  category: WqbsCategory;
  subDimension: string;
  priority: WqbsRecommendationPriority;
  reason: string;
  recommendation: string;
  expectedImpact: WqbsImpactEstimate;
  estimatedEffort: WqbsEffortEstimate;
  currentScore: number;
  targetScore: number;
};

export type WqbsBenchmarkInput = {
  id?: string;
  label?: string;
  mode?: WqbsBenchmarkMode;
  files: GeneratedProjectFile[];
  title?: string;
  description?: string;
  language?: string;
  locale?: string;
  industryId?: string;
  prompt?: string;
  businessProfile?: BusinessProfile;
  strategy?: WebsiteStrategy;
  designSystem?: DesignSystem;
  referencePlatform?: WqbsReferencePlatform;
};

export type WqbsArtifactSignals = {
  combinedContent: string;
  htmlFiles: string[];
  cssFiles: string[];
  tsxFiles: string[];
  pageCount: number;
  totalBytes: number;
  hasNav: boolean;
  hasMain: boolean;
  hasFooter: boolean;
  hasHeader: boolean;
  h1Count: number;
  headingLevels: number[];
  metaTitleCount: number;
  metaDescriptionCount: number;
  schemaMarkupCount: number;
  internalLinkCount: number;
  imageCount: number;
  imagesWithAlt: number;
  lazyLoadCount: number;
  ariaAttributeCount: number;
  focusVisibleStyles: boolean;
  ctaCount: number;
  formCount: number;
  pricingSectionCount: number;
  testimonialCount: number;
  trustBadgeCount: number;
  cssVariableCount: number;
  mediaQueryCount: number;
  fontFamilyDeclarations: number;
  whitespaceUtilityCount: number;
  langAttribute: boolean;
  dirAttribute: boolean;
  rtlHints: boolean;
  wordCount: number;
  avgWordsPerSection: number;
};

export type WqbsBenchmarkMeta = {
  benchmarkId: string;
  mode: WqbsBenchmarkMode;
  version: string;
  phase: string;
  evaluatedAt: string;
  durationMs: number;
  providerIndependent: true;
  frameworkIndependent: true;
  fileCount: number;
  pageCount: number;
};

export type WqbsQualityReport = {
  passed: boolean;
  threshold: number;
  scores: WqbsCategoryScores;
  categories: WqbsCategoryEvaluation[];
  recommendations: WqbsRecommendation[];
  strengths: string[];
  weaknesses: string[];
};

export type WqbsBenchmarkReport = WqbsQualityReport & {
  meta: WqbsBenchmarkMeta;
  mode: WqbsBenchmarkMode;
  gateStatus: "pass" | "fail" | "review";
};

export type WqbsExecutiveSummary = {
  headline: string;
  overallScore: number;
  gateStatus: "pass" | "fail" | "review";
  topStrengths: string[];
  topWeaknesses: string[];
  priorityActions: string[];
  categoryHighlights: Array<{ category: WqbsCategory; score: number; status: string }>;
};

export type WqbsTechnicalSummary = {
  scores: WqbsCategoryScores;
  subDimensionBreakdown: WqbsSubDimensionScore[];
  signals: string[];
  issues: string[];
  performanceNotes: string[];
  seoNotes: string[];
  accessibilityNotes: string[];
};

export type WqbsDeveloperSummary = {
  fixQueue: WqbsRecommendation[];
  fileHints: Array<{ path: string; hint: string }>;
  quickWins: WqbsRecommendation[];
  structuralChanges: WqbsRecommendation[];
};

export type WqbsComparisonInput = {
  generated: WqbsBenchmarkInput;
  reference: WqbsBenchmarkInput;
  referenceLabel?: string;
  mode?: WqbsBenchmarkMode;
};

export type WqbsComparisonResult = {
  generated: WqbsBenchmarkReport;
  reference: WqbsBenchmarkReport;
  overallGap: number;
  categoryGaps: Record<WqbsCategory, number>;
  strengths: string[];
  weaknesses: string[];
  missingFeatures: string[];
  qualityGap: string;
};

export type WqbsBenchmarkResult = {
  ok: true;
  report: WqbsBenchmarkReport;
  qualityReport: WqbsQualityReport;
  executiveSummary: WqbsExecutiveSummary;
  technicalSummary: WqbsTechnicalSummary;
  developerSummary: WqbsDeveloperSummary;
};

export type WqbsBenchmarkError = {
  ok: false;
  errors: string[];
};

export type WqbsBenchmarkOutcome = WqbsBenchmarkResult | WqbsBenchmarkError;
