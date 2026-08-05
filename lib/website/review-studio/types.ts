import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  BusinessProfile,
  DesignSystem,
  WebsiteStrategy,
} from "@/lib/website/types";
import type { WqbsCategoryScores } from "@/lib/website/quality-benchmark";
import type {
  ANALYZER_DIMENSIONS,
  REVIEW_AREAS,
  REVIEW_PRIORITIES,
} from "@/lib/website/review-studio/constants";

export type ReviewArea = (typeof REVIEW_AREAS)[number];
export type ReviewPriority = (typeof REVIEW_PRIORITIES)[number];
export type AnalyzerDimension = (typeof ANALYZER_DIMENSIONS)[number];

export type ReviewStudioInput = {
  sessionId?: string;
  label?: string;
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
  /** Optional upstream context — TBGE, Master Plan, AWQE, TBDP, GLS */
  upstreamContext?: {
    masterPlanId?: string;
    awqeSpecId?: string;
    awqeScore?: number;
    productionTraceId?: string;
    glsContextHash?: string;
    tbdpTemplateId?: string;
  };
};

export type AnalyzerDimensionResult = {
  dimension: AnalyzerDimension;
  score: number;
  findings: string[];
  issues: string[];
};

export type WebsiteAnalysis = {
  analyzedAt: string;
  pageCount: number;
  sectionCount: number;
  componentCount: number;
  fileCount: number;
  dimensions: AnalyzerDimensionResult[];
  detectedSections: string[];
  detectedComponents: string[];
};

export type ReviewIssue = {
  id: string;
  area: ReviewArea;
  priority: ReviewPriority;
  title: string;
  description: string;
  affectedFiles: string[];
  dimension: AnalyzerDimension;
};

export type ImpactEstimate = {
  qualityGain: number;
  seoGain: number;
  conversionGain: number;
  accessibilityGain: number;
  performanceImpact: number;
  estimatedRisk: "low" | "medium" | "high";
  estimatedTimeMinutes: number;
};

export type StudioImprovement = {
  id: string;
  area: ReviewArea;
  priority: ReviewPriority;
  title: string;
  description: string;
  recommendation: string;
  targetFiles: string[];
  patchType: "deterministic" | "targeted-regen";
  instruction?: string;
  impact: ImpactEstimate;
  issueIds: string[];
};

export type ReviewInsights = {
  overallReview: string;
  strengths: string[];
  weaknesses: string[];
  businessInsights: string[];
  technicalInsights: string[];
  designInsights: string[];
};

export type ReviewOutput = {
  overallScore: number;
  categoryScores: WqbsCategoryScores;
  insights: ReviewInsights;
  issues: ReviewIssue[];
  improvements: StudioImprovement[];
  expectedResults: string[];
};

export type ReviewStudioMeta = {
  reviewId: string;
  sessionId: string;
  version: string;
  phase: string;
  reviewedAt: string;
  durationMs: number;
  providerIndependent: true;
  frameworkIndependent: true;
};

export type WebsiteVersion = {
  versionNumber: number;
  id: string;
  sessionId: string;
  createdAt: string;
  files: GeneratedProjectFile[];
  appliedImprovements: string[];
  improvementTitles: string[];
  qualityScores: WqbsCategoryScores;
  parentVersionId?: string;
};

export type VersionComparison = {
  beforeVersionId: string;
  afterVersionId: string;
  qualityDifference: number;
  scoreDifferences: WqbsCategoryScores & { overall: number };
  seoDifference: number;
  conversionDifference: number;
  accessibilityDifference: number;
  performanceDifference: number;
  contentDifference: number;
  appliedChanges: string[];
  summary: string;
};

export type ReviewStudioResult = {
  ok: true;
  meta: ReviewStudioMeta;
  analysis: WebsiteAnalysis;
  review: ReviewOutput;
  versions: WebsiteVersion[];
  currentVersion: WebsiteVersion;
};

export type ReviewStudioError = {
  ok: false;
  errors: string[];
};

export type ReviewStudioOutcome = ReviewStudioResult | ReviewStudioError;

export type ApplyImprovementInput = {
  sessionId: string;
  improvementIds: string[];
  /** When true, allows full-site targeted regen via executor (explicit opt-in) */
  allowFullRegeneration?: boolean;
};

export type TargetedImprovementExecutor = (input: {
  instruction: string;
  targetFiles: GeneratedProjectFile[];
  allFiles: GeneratedProjectFile[];
  improvement: StudioImprovement;
}) => Promise<GeneratedProjectFile[]>;

export type ApplyImprovementResult =
  | {
      ok: true;
      version: WebsiteVersion;
      comparison: VersionComparison;
      appliedChanges: string[];
      files: GeneratedProjectFile[];
    }
  | { ok: false; errors: string[] };

export type ReviewStudioSession = {
  sessionId: string;
  input: ReviewStudioInput;
  review?: ReviewStudioResult;
  versions: WebsiteVersion[];
  improvements: StudioImprovement[];
  currentVersionId: string;
};

export type ReviewStudioPersistedVersion = {
  id: string;
  versionNumber: number;
  createdAt: string;
  appliedImprovements: string[];
  improvementTitles: string[];
  qualityScores: WqbsCategoryScores;
  parentVersionId?: string;
};

export type ReviewStudioPersistedState = {
  sessionId: string;
  versions: ReviewStudioPersistedVersion[];
  snapshots: Record<string, GeneratedProjectFile[]>;
  currentVersionId?: string;
};
