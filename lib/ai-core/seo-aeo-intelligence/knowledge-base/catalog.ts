import type { SearchIntentType } from "@/lib/ai-core/seo-aeo-intelligence/saie-types";

export type SeoKnowledgeEntry = {
  id: string;
  industryId: string;
  version: string;
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
  aeoKnowledgeEntryId: string;
  aliases?: string[];
};

export type AeoKnowledgeEntry = {
  id: string;
  version: string;
  citationSignals: string[];
  faqSignals: string[];
  entitySignals: string[];
  llmTargets: string[];
  headingRules: string[];
  accessibilitySeoPolicies: string[];
};

/** SEO Knowledge Base — EDS-006 SSOT for industry SEO policies. */
export const SEO_KNOWLEDGE_ENTRIES: SeoKnowledgeEntry[] = [
  {
    id: "seo-policy-furniture",
    industryId: "furniture",
    version: "1",
    primaryIntent: "commercial",
    minTitleLength: 30,
    maxTitleLength: 60,
    minDescriptionLength: 120,
    maxDescriptionLength: 160,
    requiredSchemaTypes: ["Organization", "WebSite", "Store"],
    topicClusterSeeds: ["luxury furniture", "living room", "showroom", "collections"],
    internalLinkingMin: 3,
    voiceSearchPatterns: ["where to buy premium furniture near me", "best furniture showroom"],
    featuredSnippetFormats: ["list", "paragraph"],
    aeoKnowledgeEntryId: "aeo-policy-commerce",
  },
  {
    id: "seo-policy-ecommerce",
    industryId: "ecommerce",
    version: "1",
    primaryIntent: "transactional",
    minTitleLength: 30,
    maxTitleLength: 60,
    minDescriptionLength: 120,
    maxDescriptionLength: 160,
    requiredSchemaTypes: ["Organization", "WebSite", "Store", "Product"],
    topicClusterSeeds: ["products", "shipping", "reviews", "collections"],
    internalLinkingMin: 4,
    voiceSearchPatterns: ["buy online", "best deals", "free shipping"],
    featuredSnippetFormats: ["list", "table"],
    aeoKnowledgeEntryId: "aeo-policy-commerce",
    aliases: ["retail", "store"],
  },
  {
    id: "seo-policy-restaurant",
    industryId: "restaurant",
    version: "1",
    primaryIntent: "local",
    minTitleLength: 30,
    maxTitleLength: 60,
    minDescriptionLength: 120,
    maxDescriptionLength: 160,
    requiredSchemaTypes: ["Organization", "WebSite", "Restaurant"],
    topicClusterSeeds: ["menu", "reservations", "dining", "cuisine"],
    internalLinkingMin: 3,
    voiceSearchPatterns: ["restaurant near me", "book a table", "opening hours"],
    featuredSnippetFormats: ["paragraph", "list"],
    aeoKnowledgeEntryId: "aeo-policy-local",
  },
  {
    id: "seo-policy-law",
    industryId: "law",
    version: "1",
    primaryIntent: "commercial",
    minTitleLength: 35,
    maxTitleLength: 60,
    minDescriptionLength: 130,
    maxDescriptionLength: 160,
    requiredSchemaTypes: ["Organization", "WebSite", "LegalService"],
    topicClusterSeeds: ["practice areas", "attorney", "consultation", "legal advice"],
    internalLinkingMin: 4,
    voiceSearchPatterns: ["lawyer near me", "free legal consultation"],
    featuredSnippetFormats: ["paragraph"],
    aeoKnowledgeEntryId: "aeo-policy-trust",
    aliases: ["legal", "law-firm"],
  },
  {
    id: "seo-policy-saas",
    industryId: "saas",
    version: "1",
    primaryIntent: "commercial",
    minTitleLength: 30,
    maxTitleLength: 60,
    minDescriptionLength: 120,
    maxDescriptionLength: 160,
    requiredSchemaTypes: ["Organization", "WebSite", "SoftwareApplication"],
    topicClusterSeeds: ["features", "pricing", "integrations", "demo"],
    internalLinkingMin: 4,
    voiceSearchPatterns: ["best software for", "how does it work", "book a demo"],
    featuredSnippetFormats: ["list", "paragraph"],
    aeoKnowledgeEntryId: "aeo-policy-saas",
  },
  {
    id: "seo-policy-agency",
    industryId: "agency",
    version: "1",
    primaryIntent: "commercial",
    minTitleLength: 30,
    maxTitleLength: 60,
    minDescriptionLength: 120,
    maxDescriptionLength: 160,
    requiredSchemaTypes: ["Organization", "WebSite", "ProfessionalService"],
    topicClusterSeeds: ["portfolio", "case studies", "services", "creative"],
    internalLinkingMin: 3,
    voiceSearchPatterns: ["creative agency near me", "branding services"],
    featuredSnippetFormats: ["paragraph", "list"],
    aeoKnowledgeEntryId: "aeo-policy-trust",
  },
  {
    id: "seo-policy-default",
    industryId: "business",
    version: "1",
    primaryIntent: "commercial",
    minTitleLength: 30,
    maxTitleLength: 60,
    minDescriptionLength: 120,
    maxDescriptionLength: 160,
    requiredSchemaTypes: ["Organization", "WebSite", "LocalBusiness"],
    topicClusterSeeds: ["services", "about", "contact", "solutions"],
    internalLinkingMin: 3,
    voiceSearchPatterns: ["services near me", "how to contact"],
    featuredSnippetFormats: ["paragraph"],
    aeoKnowledgeEntryId: "aeo-policy-default",
    aliases: ["corporate", "company"],
  },
];

/** AEO Knowledge Base — AI answer optimization policies. */
export const AEO_KNOWLEDGE_ENTRIES: AeoKnowledgeEntry[] = [
  {
    id: "aeo-policy-default",
    version: "1",
    citationSignals: [
      "Clear entity definition in first paragraph",
      "FAQ with direct answers",
      "Consistent brand naming across headings",
    ],
    faqSignals: ["Question-answer pairs with schema FAQPage"],
    entitySignals: ["Organization schema with knowsAbout"],
    llmTargets: ["google-ai-overviews", "chatgpt-search", "perplexity"],
    headingRules: ["Single H1 with primary keyword", "Logical H2/H3 hierarchy"],
    accessibilitySeoPolicies: ["Descriptive link text", "Alt text on images"],
  },
  {
    id: "aeo-policy-commerce",
    version: "1",
    citationSignals: [
      "Product/service entity with offer description",
      "Trust signals and geography",
      "Structured Product/Store schema",
    ],
    faqSignals: ["Shipping, returns, and product FAQs"],
    entitySignals: ["Store + Product entities linked"],
    llmTargets: ["google-ai-overviews", "gemini-search", "chatgpt-search"],
    headingRules: ["H1 product category", "H2 collections/features"],
    accessibilitySeoPolicies: ["Product alt text", "Readable CTA labels"],
  },
  {
    id: "aeo-policy-local",
    version: "1",
    citationSignals: [
      "NAP consistency (name, address, phone)",
      "LocalBusiness schema with areaServed",
      "Hours and reservation CTA",
    ],
    faqSignals: ["Location, hours, menu FAQs"],
    entitySignals: ["LocalBusiness + Place entities"],
    llmTargets: ["google-search", "google-ai-overviews", "voice-assistants"],
    headingRules: ["H1 with location intent", "H2 menu/services"],
    accessibilitySeoPolicies: ["Accessible contact forms"],
  },
  {
    id: "aeo-policy-trust",
    version: "1",
    citationSignals: [
      "Authority signals and credentials",
      "Practice area expertise statements",
      "ProfessionalService schema",
    ],
    faqSignals: ["Service process and consultation FAQs"],
    entitySignals: ["LegalService/ProfessionalService entities"],
    llmTargets: ["google-ai-overviews", "perplexity"],
    headingRules: ["H1 authority positioning", "H2 practice areas"],
    accessibilitySeoPolicies: ["Readable legal disclaimers"],
  },
  {
    id: "aeo-policy-saas",
    version: "1",
    citationSignals: [
      "SoftwareApplication schema with features",
      "Use-case driven FAQ",
      "Integration and pricing clarity",
    ],
    faqSignals: ["Pricing, security, integration FAQs"],
    entitySignals: ["SoftwareApplication + Organization"],
    llmTargets: ["chatgpt-search", "gemini-search", "google-ai-overviews"],
    headingRules: ["H1 product value prop", "H2 feature clusters"],
    accessibilitySeoPolicies: ["UI screenshots described in alt"],
  },
];

const seoByIndustry = new Map<string, SeoKnowledgeEntry>();
const seoAliasToId = new Map<string, string>();
const aeoById = new Map<string, AeoKnowledgeEntry>();

for (const entry of SEO_KNOWLEDGE_ENTRIES) {
  seoByIndustry.set(entry.industryId, entry);
  seoAliasToId.set(entry.industryId, entry.industryId);
  for (const alias of entry.aliases ?? []) {
    seoAliasToId.set(alias.toLowerCase(), entry.industryId);
  }
}

for (const entry of AEO_KNOWLEDGE_ENTRIES) {
  aeoById.set(entry.id, entry);
}

export function getSeoKnowledgeEntry(industryId: string): SeoKnowledgeEntry {
  const normalized = industryId.toLowerCase().trim().replace(/[_\s]+/g, "-");
  const resolved = seoAliasToId.get(normalized) ?? normalized;
  return seoByIndustry.get(resolved) ?? seoByIndustry.get("business")!;
}

export function getAeoKnowledgeEntry(id: string): AeoKnowledgeEntry {
  return aeoById.get(id) ?? aeoById.get("aeo-policy-default")!;
}
