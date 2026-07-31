import type { ContentPolicy } from "@/lib/ai-core/content-intelligence/types";

export type ContentKnowledgeEntry = {
  id: string;
  industryId: string;
  version: string;
  forbiddenSubjects: string[];
  minServices: number;
  minTestimonials: number;
  minFaq: number;
  minSeoDescriptionLength: number;
  toneKeywords: string[];
  aliases?: string[];
};

/** Content Knowledge Base — industry content policies (EDS-003 SSOT). */
export const CONTENT_KNOWLEDGE_ENTRIES: ContentKnowledgeEntry[] = [
  {
    id: "content-policy-furniture",
    industryId: "furniture",
    version: "1",
    forbiddenSubjects: [
      "fashion",
      "runway",
      "swimwear",
      "water park",
      "ocean",
      "travel agency",
    ],
    minServices: 2,
    minTestimonials: 2,
    minFaq: 2,
    minSeoDescriptionLength: 50,
    toneKeywords: ["premium", "craft", "showroom", "living"],
  },
  {
    id: "content-policy-ecommerce",
    industryId: "ecommerce",
    version: "1",
    forbiddenSubjects: ["law firm", "dental clinic", "hospital"],
    minServices: 3,
    minTestimonials: 2,
    minFaq: 3,
    minSeoDescriptionLength: 50,
    toneKeywords: ["shop", "collection", "catalog"],
    aliases: ["retail", "store"],
  },
  {
    id: "content-policy-restaurant",
    industryId: "restaurant",
    version: "1",
    forbiddenSubjects: ["software", "saas", "cybersecurity"],
    minServices: 2,
    minTestimonials: 2,
    minFaq: 3,
    minSeoDescriptionLength: 50,
    toneKeywords: ["menu", "dining", "chef", "cuisine"],
  },
  {
    id: "content-policy-law",
    industryId: "law",
    version: "1",
    forbiddenSubjects: ["ecommerce", "fashion", "restaurant menu"],
    minServices: 3,
    minTestimonials: 2,
    minFaq: 4,
    minSeoDescriptionLength: 60,
    toneKeywords: ["trust", "authority", "counsel", "compliance"],
    aliases: ["legal", "law-firm"],
  },
  {
    id: "content-policy-clinic",
    industryId: "clinic",
    version: "1",
    forbiddenSubjects: ["ecommerce", "fashion", "travel deals"],
    minServices: 2,
    minTestimonials: 2,
    minFaq: 4,
    minSeoDescriptionLength: 60,
    toneKeywords: ["care", "health", "patient", "wellness"],
    aliases: ["medical", "healthcare"],
  },
  {
    id: "content-policy-agency",
    industryId: "agency",
    version: "1",
    forbiddenSubjects: ["dental", "manufacturing plant"],
    minServices: 3,
    minTestimonials: 2,
    minFaq: 2,
    minSeoDescriptionLength: 50,
    toneKeywords: ["creative", "portfolio", "brand"],
  },
  {
    id: "content-policy-default",
    industryId: "business",
    version: "1",
    forbiddenSubjects: [],
    minServices: 2,
    minTestimonials: 2,
    minFaq: 2,
    minSeoDescriptionLength: 50,
    toneKeywords: ["professional", "trusted"],
    aliases: ["corporate", "company"],
  },
];

const byIndustry = new Map<string, ContentKnowledgeEntry>();
const aliasToId = new Map<string, string>();

for (const entry of CONTENT_KNOWLEDGE_ENTRIES) {
  byIndustry.set(entry.industryId, entry);
  aliasToId.set(entry.industryId, entry.industryId);
  for (const alias of entry.aliases ?? []) {
    aliasToId.set(alias.toLowerCase(), entry.industryId);
  }
}

export function getContentKnowledgeEntry(
  industryId: string,
): ContentKnowledgeEntry {
  const normalized = industryId.toLowerCase().trim().replace(/[_\s]+/g, "-");
  const resolved = aliasToId.get(normalized) ?? normalized;
  return byIndustry.get(resolved) ?? byIndustry.get("business")!;
}

export function contentKnowledgeToPolicy(
  entry: ContentKnowledgeEntry,
  overrides?: Partial<ContentPolicy>,
): Omit<ContentPolicy, "industryId" | "knowledgeEntryId"> {
  return {
    requiredSections: overrides?.requiredSections ?? [],
    forbiddenSubjects: [
      ...entry.forbiddenSubjects,
      ...(overrides?.forbiddenSubjects ?? []),
    ],
    minServices: entry.minServices,
    minTestimonials: entry.minTestimonials,
    minFaq: entry.minFaq,
    minSeoDescriptionLength: entry.minSeoDescriptionLength,
    tone: overrides?.tone ?? entry.toneKeywords[0] ?? "professional",
    toneKeywords: entry.toneKeywords,
    primaryCta: overrides?.primaryCta,
    heroKeywords: overrides?.heroKeywords ?? [],
  };
}
