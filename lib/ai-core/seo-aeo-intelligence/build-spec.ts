import type { AgencyGenerationContract } from "@/lib/ai-core/agency-orchestrator/types";
import type { ImageSystemSpec } from "@/lib/ai-core/image-intelligence/iie-types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import { assembleSeoPackage, type AssembleSeoPackageInput } from "@/lib/ai-core/seo/assemble-package";
import { buildKeywordPlan } from "@/lib/ai-core/seo-performance/keywords";
import type {
  AeoOptimization,
  FeaturedSnippetPlan,
  HeadingHierarchyPlan,
  ImageSeoPlan,
  InternalLinkPlan,
  NormalizedEntity,
  SeoPolicy,
  SemanticTopicCluster,
  SEOSpecification,
  VoiceSearchPlan,
} from "@/lib/ai-core/seo-aeo-intelligence/saie-types";

export type BuildSeoAeoSpecParams = AssembleSeoPackageInput & {
  policy: SeoPolicy;
  imageSystemSpec?: ImageSystemSpec | null;
};

function buildTopicClusters(
  policy: SeoPolicy,
  keywordPlan: ReturnType<typeof buildKeywordPlan>,
): SemanticTopicCluster[] {
  return policy.topicClusterSeeds.map((seed, i) => ({
    id: `cluster-${i}`,
    label: seed,
    keywords: [
      seed,
      keywordPlan.secondary[i % Math.max(keywordPlan.secondary.length, 1)] ||
        keywordPlan.primary,
    ].filter(Boolean),
    intent: policy.primaryIntent,
  }));
}

function extractEntities(
  profile: CoreBusinessProfile | undefined,
  brand: string,
  keywords: string[],
): NormalizedEntity[] {
  const entities: NormalizedEntity[] = [
    {
      id: "entity-org",
      name: brand,
      type: "Organization",
      aliases: [brand, profile?.projectName || brand].filter(Boolean),
    },
  ];
  if (profile?.offer) {
    entities.push({
      id: "entity-service",
      name: profile.offer,
      type: "Service",
      aliases: [profile.offer],
    });
  }
  if (profile?.geography) {
    entities.push({
      id: "entity-place",
      name: profile.geography,
      type: "Place",
      aliases: [profile.geography],
    });
  }
  for (const kw of keywords.slice(0, 3)) {
    entities.push({
      id: `entity-topic-${kw.slice(0, 12)}`,
      name: kw,
      type: "Topic",
      aliases: [kw],
    });
  }
  return entities;
}

function buildInternalLinks(
  strategy: CoreProductStrategy,
  policy: SeoPolicy,
  primaryKeyword: string,
): InternalLinkPlan[] {
  const pages = strategy.pages ?? [];
  const links: InternalLinkPlan[] = [];
  for (const page of pages.slice(0, policy.internalLinkingMin + 2)) {
    const path = page.path.startsWith("/") ? page.path : `/${page.path}`;
    if (path === "/") continue;
    links.push({
      fromPath: "/",
      toPath: path,
      anchorText: page.name || primaryKeyword,
      reason: `Hub link to ${page.purpose || page.name}`,
    });
  }
  while (links.length < policy.internalLinkingMin) {
    links.push({
      fromPath: "/",
      toPath: "/#contact",
      anchorText: "Contact",
      reason: "Conversion path internal link",
    });
  }
  return links.slice(0, Math.max(policy.internalLinkingMin, links.length));
}

function buildHeadingPlan(
  policy: SeoPolicy,
  keywordPlan: ReturnType<typeof buildKeywordPlan>,
  strategy: CoreProductStrategy,
): HeadingHierarchyPlan {
  const sections = strategy.sectionPlan ?? [];
  return {
    rules: policy.headingRules,
    expectedH1: keywordPlan.primary,
    sectionHeadings: sections.map((s) => s.name).slice(0, 8),
  };
}

function buildImageSeoPlans(
  imageSystemSpec?: ImageSystemSpec | null,
): ImageSeoPlan[] {
  if (!imageSystemSpec?.specifications?.length) return [];
  return imageSystemSpec.specifications.map((spec) => ({
    imageId: spec.id,
    altText: spec.accessibility.altText,
    seoDescription: spec.seo.description,
    keywords: spec.seo.keywords,
  }));
}

function buildAeoOptimization(
  policy: SeoPolicy,
  entities: NormalizedEntity[],
  schemaTypes: string[],
  agencyContract?: AgencyGenerationContract | null,
): AeoOptimization {
  let score = 50;
  if (schemaTypes.includes("Organization")) score += 10;
  if (schemaTypes.includes("FAQPage")) score += 15;
  if (schemaTypes.includes("WebSite")) score += 5;
  if (entities.length >= 3) score += 10;
  if (agencyContract?.content.faq?.length) score += 10;
  score = Math.min(100, score);

  return {
    targets: ["google-search", "google-ai-overviews", "chatgpt-search", "perplexity"],
    entityOptimization: [
      `Primary entity: ${entities[0]?.name || "Brand"}`,
      ...policy.aeoCitationSignals,
    ],
    citationReadiness: [
      "Direct answer paragraphs in hero and FAQ",
      "Consistent entity naming in title, H1, and schema",
      ...policy.aeoCitationSignals.slice(0, 2),
    ],
    faqSignals: agencyContract?.content.faq?.length
      ? [`${agencyContract.content.faq.length} FAQ entries for FAQPage schema`]
      : ["Add FAQ section for AEO citation readiness"],
    schemaCoverage: schemaTypes,
    readinessScore: score,
    summary: `AEO readiness ${score}/100 with schema [${schemaTypes.join(", ")}]`,
  };
}

function buildVoiceSearch(policy: SeoPolicy, brand: string): VoiceSearchPlan {
  return {
    patterns: policy.voiceSearchPatterns,
    conversationalQueries: policy.voiceSearchPatterns.map(
      (p) => `${p} ${brand}`.trim(),
    ),
  };
}

function buildFeaturedSnippets(
  policy: SeoPolicy,
  keywordPlan: ReturnType<typeof buildKeywordPlan>,
): FeaturedSnippetPlan[] {
  return policy.featuredSnippetFormats.map((format, i) => ({
    format: format as FeaturedSnippetPlan["format"],
    targetQuery: policy.voiceSearchPatterns[i] || keywordPlan.longTail[0] || keywordPlan.primary,
    answerOutline: `Direct answer about ${keywordPlan.primary} for ${format} snippet`,
  }));
}

/**
 * Build the authoritative SEOSpecification — search optimization plan only (no rendering).
 */
export function buildSeoAeoSpecification(
  params: BuildSeoAeoSpecParams,
): SEOSpecification {
  const { policy, strategy, profile } = params;
  const brand =
    params.agencyContract?.brandKit.companyName || profile?.projectName || "Business";

  const keywordPlan = buildKeywordPlan({
    strategy,
    profile,
    industryId: params.industryId,
    premiumSeoTopics: params.premiumSeoTopics,
    premiumKeywords: params.premiumKeywords ?? policy.lockedKeywords,
  });

  const seoPackage = assembleSeoPackage({
    ...params,
    premiumKeywords: params.premiumKeywords ?? policy.lockedKeywords,
  });

  if (seoPackage.metadata.description.length < policy.minDescriptionLength) {
    const padding = [
      profile?.offer,
      profile?.summary,
      keywordPlan.longTail[0],
      policy.topicClusterSeeds[0],
    ]
      .filter(Boolean)
      .join(" — ");
    seoPackage.metadata.description = [
      seoPackage.metadata.description,
      padding,
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, policy.maxDescriptionLength);
    seoPackage.openGraph.description = seoPackage.metadata.description;
    if (seoPackage.twitter) {
      seoPackage.twitter.description = seoPackage.metadata.description;
    }
  }

  const clusters = buildTopicClusters(policy, keywordPlan);
  const entities = extractEntities(profile, brand, seoPackage.keywords);
  const schemaTypes = seoPackage.structuredData.map((s) => s.type);
  const internalLinks = buildInternalLinks(strategy, policy, keywordPlan.primary);
  const headingHierarchy = buildHeadingPlan(policy, keywordPlan, strategy);
  const imageSeo = buildImageSeoPlans(params.imageSystemSpec);

  const paths = seoPackage.sitemap.map((s) => s.path);

  return {
    version: "1",
    industryId: policy.industryId,
    keywordIntelligence: { ...keywordPlan, clusters },
    searchIntent: {
      primary: policy.primaryIntent,
      reasoning: `SKB primary intent for ${policy.industryId}: ${policy.primaryIntent}`,
      secondaryIntents:
        policy.primaryIntent === "commercial"
          ? ["informational", "navigational"]
          : ["commercial"],
    },
    entities,
    metadata: seoPackage.metadata,
    openGraph: seoPackage.openGraph,
    twitter: seoPackage.twitter,
    structuredData: seoPackage.structuredData,
    sitemap: seoPackage.sitemap,
    canonical: {
      primaryPath: seoPackage.metadata.canonicalPath || "/",
      alternatePaths: paths.filter((p) => p !== "/"),
      notes: "Canonical locked to primary landing path",
    },
    urlStructure: {
      paths,
      pattern: "flat-marketing-site",
      notes: "URL paths derived from strategy sitemap and pages",
    },
    internalLinks,
    headingHierarchy,
    imageSeo,
    accessibilitySeo: policy.accessibilitySeoPolicies,
    aeo: buildAeoOptimization(
      policy,
      entities,
      schemaTypes,
      params.agencyContract,
    ),
    voiceSearch: buildVoiceSearch(policy, brand),
    featuredSnippets: buildFeaturedSnippets(policy, keywordPlan),
    seoPackage,
  };
}
