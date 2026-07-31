import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { KeywordPlan } from "@/lib/ai-core/seo-performance/types";

export const SEO_AEO_INTELLIGENCE_TRACE_KEY = "seoAeoIntelligenceTrace";
export const SEO_AEO_INTELLIGENCE_SPEC_KEY = "seoAeoSpecification";
export const SEO_AEO_INTELLIGENCE_ENGINE_ID = "seo-aeo-intelligence-engine";
export const SEO_AEO_INTELLIGENCE_ENGINE_VERSION = "1.0.0";

export type SeoAeoPhaseId =
  | "policy-resolve"
  | "keyword-intelligence"
  | "search-intent"
  | "topic-clustering"
  | "entity-extraction"
  | "metadata-planning"
  | "structured-data"
  | "open-graph"
  | "canonical-urls"
  | "url-structure"
  | "internal-linking"
  | "heading-hierarchy"
  | "content-alignment"
  | "image-seo"
  | "accessibility-seo"
  | "aeo-optimization"
  | "voice-search"
  | "featured-snippets"
  | "validation"
  | "spec-lock";

export type SeoAeoTraceEntry = {
  id: string;
  phase: SeoAeoPhaseId;
  ruleId: string;
  passed: boolean;
  severity: "info" | "warning" | "error";
  message: string;
  knowledgeEntryId?: string;
  timestamp: string;
};

export type SeoAeoIntelligenceTrace = {
  version: "1";
  engineId: typeof SEO_AEO_INTELLIGENCE_ENGINE_ID;
  engineVersion: typeof SEO_AEO_INTELLIGENCE_ENGINE_VERSION;
  createdAt: string;
  industryId: string;
  phases: SeoAeoPhaseId[];
  entries: SeoAeoTraceEntry[];
  summary: string;
};

export type SearchIntentType =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational"
  | "local";

export type SeoPolicy = {
  industryId: string;
  knowledgeEntryId: string;
  aeoKnowledgeEntryId: string;
  primaryIntent: SearchIntentType;
  minTitleLength: number;
  maxTitleLength: number;
  minDescriptionLength: number;
  maxDescriptionLength: number;
  requiredSchemaTypes: string[];
  topicClusterSeeds: string[];
  internalLinkingMin: number;
  voiceSearchPatterns: string[];
  featuredSnippetFormats: string[];
  aeoCitationSignals: string[];
  headingRules: string[];
  accessibilitySeoPolicies: string[];
  lockedKeywords: string[];
};

export type NormalizedEntity = {
  id: string;
  name: string;
  type: "Organization" | "Product" | "Service" | "Place" | "Person" | "Topic";
  aliases: string[];
};

export type SemanticTopicCluster = {
  id: string;
  label: string;
  keywords: string[];
  intent: SearchIntentType;
};

export type InternalLinkPlan = {
  fromPath: string;
  toPath: string;
  anchorText: string;
  reason: string;
};

export type HeadingHierarchyPlan = {
  rules: string[];
  expectedH1: string;
  sectionHeadings: string[];
};

export type ImageSeoPlan = {
  imageId: string;
  altText: string;
  seoDescription: string;
  keywords: string[];
};

export type AeoOptimization = {
  targets: string[];
  entityOptimization: string[];
  citationReadiness: string[];
  faqSignals: string[];
  schemaCoverage: string[];
  readinessScore: number;
  summary: string;
};

export type VoiceSearchPlan = {
  patterns: string[];
  conversationalQueries: string[];
};

export type FeaturedSnippetPlan = {
  format: "paragraph" | "list" | "table";
  targetQuery: string;
  answerOutline: string;
};

/** Provider-independent SEO specification — SSOT for metadata and structured data. */
export type SEOSpecification = {
  version: "1";
  industryId: string;
  keywordIntelligence: KeywordPlan & { clusters: SemanticTopicCluster[] };
  searchIntent: {
    primary: SearchIntentType;
    reasoning: string;
    secondaryIntents: SearchIntentType[];
  };
  entities: NormalizedEntity[];
  metadata: CoreSeoPackage["metadata"];
  openGraph: CoreSeoPackage["openGraph"];
  twitter: CoreSeoPackage["twitter"];
  structuredData: CoreSeoPackage["structuredData"];
  sitemap: CoreSeoPackage["sitemap"];
  canonical: {
    primaryPath: string;
    alternatePaths: string[];
    notes: string;
  };
  urlStructure: {
    paths: string[];
    pattern: string;
    notes: string;
  };
  internalLinks: InternalLinkPlan[];
  headingHierarchy: HeadingHierarchyPlan;
  imageSeo: ImageSeoPlan[];
  accessibilitySeo: string[];
  aeo: AeoOptimization;
  voiceSearch: VoiceSearchPlan;
  featuredSnippets: FeaturedSnippetPlan[];
  /** Locked SEO package for injection — derived from this specification. */
  seoPackage: CoreSeoPackage;
};

export type SeoAeoValidation = {
  valid: boolean;
  warnings: string[];
  errors: string[];
  trace: SeoAeoTraceEntry[];
  corrections: string[];
};

export type SeoAeoIntelligenceEngineResult = {
  spec: SEOSpecification;
  validation: SeoAeoValidation;
  trace: SeoAeoIntelligenceTrace;
  policy: SeoPolicy;
};
