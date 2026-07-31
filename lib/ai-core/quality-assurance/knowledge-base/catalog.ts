export type QualityKnowledgeEntry = {
  id: string;
  industryId: string;
  version: string;
  minConfidenceScore: number;
  minPublishScore: number;
  requiredEngineTraces: string[];
  requiredDimensions: string[];
  autoHealEnabled: boolean;
  maxAutoHealActions: number;
  forbiddenPlaceholderPhrases: string[];
  securityChecks: string[];
  complianceChecks: string[];
  aliases?: string[];
};

/** Quality Knowledge Base — EDS-007 SSOT for pipeline quality policies. */
export const QUALITY_KNOWLEDGE_ENTRIES: QualityKnowledgeEntry[] = [
  {
    id: "quality-policy-furniture",
    industryId: "furniture",
    version: "1",
    minConfidenceScore: 70,
    minPublishScore: 65,
    requiredEngineTraces: [
      "planningReasoningTrace",
      "contentIntelligenceTrace",
      "designIntelligenceTrace",
      "imageIntelligenceTrace",
      "seoAeoIntelligenceTrace",
    ],
    requiredDimensions: [
      "structure",
      "brand",
      "content",
      "media",
      "seo",
      "accessibility",
    ],
    autoHealEnabled: true,
    maxAutoHealActions: 5,
    forbiddenPlaceholderPhrases: [
      "lorem ipsum",
      "your company",
      "placeholder text",
      "sample text",
    ],
    securityChecks: ["no-inline-scripts", "no-exposed-secrets"],
    complianceChecks: ["wcag-aa-baseline"],
  },
  {
    id: "quality-policy-ecommerce",
    industryId: "ecommerce",
    version: "1",
    minConfidenceScore: 72,
    minPublishScore: 68,
    requiredEngineTraces: [
      "planningReasoningTrace",
      "contentIntelligenceTrace",
      "designIntelligenceTrace",
      "imageIntelligenceTrace",
      "seoAeoIntelligenceTrace",
    ],
    requiredDimensions: [
      "structure",
      "brand",
      "content",
      "media",
      "seo",
      "performance",
      "accessibility",
    ],
    autoHealEnabled: true,
    maxAutoHealActions: 6,
    forbiddenPlaceholderPhrases: [
      "lorem ipsum",
      "your store",
      "placeholder",
    ],
    securityChecks: ["no-inline-scripts", "checkout-https"],
    complianceChecks: ["wcag-aa-baseline", "product-disclosure"],
    aliases: ["retail", "store"],
  },
  {
    id: "quality-policy-law",
    industryId: "law",
    version: "1",
    minConfidenceScore: 75,
    minPublishScore: 70,
    requiredEngineTraces: [
      "planningReasoningTrace",
      "contentIntelligenceTrace",
      "designIntelligenceTrace",
      "seoAeoIntelligenceTrace",
    ],
    requiredDimensions: [
      "structure",
      "brand",
      "content",
      "seo",
      "accessibility",
      "compliance",
    ],
    autoHealEnabled: true,
    maxAutoHealActions: 4,
    forbiddenPlaceholderPhrases: [
      "lorem ipsum",
      "law firm name",
      "attorney name here",
    ],
    securityChecks: ["no-inline-scripts", "no-pii-leak"],
    complianceChecks: ["wcag-aa-baseline", "legal-disclaimer-present"],
  },
  {
    id: "quality-policy-saas",
    industryId: "saas",
    version: "1",
    minConfidenceScore: 71,
    minPublishScore: 66,
    requiredEngineTraces: [
      "planningReasoningTrace",
      "contentIntelligenceTrace",
      "designIntelligenceTrace",
      "imageIntelligenceTrace",
      "seoAeoIntelligenceTrace",
    ],
    requiredDimensions: [
      "structure",
      "brand",
      "content",
      "media",
      "seo",
      "performance",
      "accessibility",
    ],
    autoHealEnabled: true,
    maxAutoHealActions: 5,
    forbiddenPlaceholderPhrases: ["lorem ipsum", "your product", "saas name"],
    securityChecks: ["no-inline-scripts", "no-api-keys"],
    complianceChecks: ["wcag-aa-baseline", "privacy-signals"],
  },
  {
    id: "quality-policy-default",
    industryId: "business",
    version: "1",
    minConfidenceScore: 65,
    minPublishScore: 60,
    requiredEngineTraces: [
      "planningReasoningTrace",
      "contentIntelligenceTrace",
      "designIntelligenceTrace",
    ],
    requiredDimensions: [
      "structure",
      "brand",
      "content",
      "seo",
      "accessibility",
    ],
    autoHealEnabled: true,
    maxAutoHealActions: 5,
    forbiddenPlaceholderPhrases: [
      "lorem ipsum",
      "your company",
      "company name",
      "placeholder text",
      "todo:",
    ],
    securityChecks: ["no-inline-scripts"],
    complianceChecks: ["wcag-aa-baseline"],
    aliases: ["corporate", "company", "agency", "restaurant"],
  },
];

const byIndustry = new Map<string, QualityKnowledgeEntry>();
const aliasToId = new Map<string, string>();

for (const entry of QUALITY_KNOWLEDGE_ENTRIES) {
  byIndustry.set(entry.industryId, entry);
  aliasToId.set(entry.industryId, entry.industryId);
  for (const alias of entry.aliases ?? []) {
    aliasToId.set(alias.toLowerCase(), entry.industryId);
  }
}

export function getQualityKnowledgeEntry(industryId: string): QualityKnowledgeEntry {
  const normalized = industryId.toLowerCase().trim().replace(/[_\s]+/g, "-");
  const resolved = aliasToId.get(normalized) ?? normalized;
  return byIndustry.get(resolved) ?? byIndustry.get("business")!;
}
