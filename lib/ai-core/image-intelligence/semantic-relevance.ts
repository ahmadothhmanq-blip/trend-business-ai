import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type { DesignSystemSpec } from "@/lib/ai-core/design-intelligence/die-types";
import type { ImageIntelligenceContext } from "@/lib/ai-core/image-engine/types";
import {
  composeImagePrompt,
  buildAccessibleAltText,
} from "@/lib/ai-core/image-engine/intelligence";
import { buildImageArtDirection } from "@/lib/ai-core/image-engine/art-direction";
import type { SectionKey } from "@/lib/ai-core/image-engine/section-strategies";
import { inferSectionKey } from "@/lib/ai-core/image-engine/section-strategies";
import type {
  ImagePolicy,
  ImageSpecification,
} from "@/lib/ai-core/image-intelligence/iie-types";
import type {
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

export type SemanticImageContext = {
  policy: ImagePolicy;
  ctx: ImageIntelligenceContext;
  strategy: CoreProductStrategy;
  brandIdentity?: BrandIdentityBrief | null;
  designSystemSpec?: DesignSystemSpec | null;
};

export type SemanticVisualConcept = {
  subject: string;
  scene: string;
  storytellingRole: string;
  visualConcept: string;
  sectionPurpose: string;
  pagePurpose: string;
};

/** Phrases that indicate generic / unrelated stock imagery — never ship these. */
export const GENERIC_IMAGE_PHRASES = [
  "generic stock",
  "placeholder image",
  "random office",
  "business handshake",
  "diverse team smiling",
  "corporate meeting room",
  "unsplash",
  "lorem ipsum",
  "stock photo smile",
];

type ConceptRule = {
  pattern: RegExp;
  concept: string;
};

/** Industry + section-topic → semantically appropriate visual concepts. */
const INDUSTRY_SEMANTIC_RULES: Record<string, ConceptRule[]> = {
  furniture: [
    { pattern: /sustain|eco|recycl|green/i, concept: "natural wood textures, sustainable craftsmanship, recycled materials workshop" },
    { pattern: /living\s*room|lounge|sofa/i, concept: "luxury living room interior with curated sofa and warm ambient lighting" },
    { pattern: /craft|artisan|workshop|maker/i, concept: "artisan furniture workshop, hands shaping wood, craftsmanship detail" },
    { pattern: /material|wood|grain|texture/i, concept: "close-up wood grain and premium material textures" },
    { pattern: /collection|catalog|showroom/i, concept: "designer furniture showroom vignette with hero piece" },
    { pattern: /hero|banner/i, concept: "flagship furniture piece in aspirational interior setting" },
  ],
  restaurant: [
    { pattern: /hero|banner/i, concept: "signature dish beautifully plated, restaurant-quality food photography" },
    { pattern: /story|about|chef/i, concept: "chef preparing food in open kitchen, authentic culinary craft" },
    { pattern: /ingredient|farm|local|fresh/i, concept: "fresh local produce and premium ingredients on rustic surface" },
    { pattern: /dining|interior|ambiance/i, concept: "inviting dining room atmosphere with warm lighting" },
    { pattern: /menu|dish|course/i, concept: "artfully plated course highlighting cuisine identity" },
  ],
  law: [
    { pattern: /trust|client|consult/i, concept: "lawyer consulting with client in professional setting, trust and clarity" },
    { pattern: /office|meeting|board/i, concept: "premium law firm meeting room with refined wood and glass" },
    { pattern: /team|attorney|partner/i, concept: "professional attorney team portraits, confident and approachable" },
    { pattern: /hero/i, concept: "prestigious law office exterior or distinguished library interior" },
  ],
  clinic: [
    { pattern: /care|patient|doctor/i, concept: "caring doctor with patient in modern clinical environment" },
    { pattern: /tech|equipment|diagnostic/i, concept: "modern medical equipment in clean clinical setting" },
    { pattern: /reception|environment|facility/i, concept: "clean welcoming clinic reception with natural light" },
    { pattern: /hero/i, concept: "compassionate healthcare professional in bright modern clinic" },
  ],
  ecommerce: [
    { pattern: /product|catalog|grid/i, concept: "hero product on minimal studio backdrop with brand lighting" },
    { pattern: /lifestyle|use/i, concept: "product in authentic lifestyle context matching target buyer" },
  ],
  saas: [
    { pattern: /dashboard|product|platform/i, concept: "clean product UI context with real team collaboration" },
    { pattern: /team|culture/i, concept: "focused product team in modern workspace, authentic not stock-generic" },
  ],
};

const DEFAULT_SECTION_CONCEPTS: Partial<Record<SectionKey, string>> = {
  hero: "primary brand story moment with clear subject hierarchy for above-the-fold impact",
  about: "authentic brand story scene aligned with business narrative",
  services: "service delivery in action, specific to industry not generic office",
  features: "product or capability detail shot supporting section message",
  team: "professional team portraits with industry-appropriate environment",
  gallery: "curated portfolio of industry-specific work or products",
  testimonials: "credible client context or portrait supporting social proof",
  contact: "welcoming location or consultation moment",
};

function normalizeIndustry(industry: string): string {
  const raw = industry.toLowerCase();
  if (raw.includes("furniture") || raw.includes("sofa") || raw.includes("home")) return "furniture";
  if (raw.includes("restaurant") || raw.includes("food") || raw.includes("cafe")) return "restaurant";
  if (raw.includes("law") || raw.includes("legal") || raw.includes("attorney")) return "law";
  if (raw.includes("clinic") || raw.includes("health") || raw.includes("medical")) return "clinic";
  if (raw.includes("ecommerce") || raw.includes("retail") || raw.includes("store")) return "ecommerce";
  if (raw.includes("saas") || raw.includes("software")) return "saas";
  return raw.replace(/[_\s]+/g, "-");
}

function resolvePagePurpose(strategy: CoreProductStrategy, sectionName?: string): string {
  const pages = strategy.pages ?? [];
  if (!sectionName) {
    return pages[0]?.purpose || strategy.positioning || "primary website page";
  }
  const hay = sectionName.toLowerCase();
  const page = pages.find(
    (p) =>
      hay.includes(p.name.toLowerCase()) ||
      p.keySections?.some((k) => hay.includes(k.toLowerCase())),
  );
  return page?.purpose || pages[0]?.purpose || strategy.positioning || "website page";
}

function matchIndustryConcept(
  industry: string,
  signals: string,
): string | undefined {
  const rules = INDUSTRY_SEMANTIC_RULES[normalizeIndustry(industry)] ?? [];
  for (const rule of rules) {
    if (rule.pattern.test(signals)) return rule.concept;
  }
  return undefined;
}

function extractContentSignals(
  strategy: CoreProductStrategy,
  sectionLabel?: string,
  sectionPurpose?: string,
  contentNotes?: string,
): string {
  const pillars = strategy.contentStrategy?.messagingPillars ?? [];
  const topics = strategy.contentStrategy?.seoTopics ?? [];
  const seoFocus = strategy.seoFocus ?? [];
  return [
    sectionLabel,
    sectionPurpose,
    contentNotes,
    ...pillars,
    ...topics.slice(0, 4),
    ...seoFocus.slice(0, 4),
    strategy.positioning,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Resolve the most appropriate visual concept for a section using
 * section purpose, page purpose, industry, brand, and content signals.
 */
export function resolveSemanticVisualConcept(params: {
  industryId: string;
  sectionLabel?: string;
  sectionKey?: SectionKey;
  sectionPurpose?: string;
  contentNotes?: string;
  purpose: ImageSpecification["purpose"];
  ctx: ImageIntelligenceContext;
  strategy: CoreProductStrategy;
  brandIdentity?: BrandIdentityBrief | null;
  structuredBrief?: string;
}): SemanticVisualConcept {
  const sectionKey =
    params.sectionKey ||
    inferSectionKey(params.sectionLabel || params.purpose);
  const sectionPurpose =
    params.sectionPurpose ||
    params.contentNotes ||
    params.structuredBrief ||
    DEFAULT_SECTION_CONCEPTS[sectionKey] ||
    `${params.sectionLabel || sectionKey} section supporting content`;
  const pagePurpose = resolvePagePurpose(
    params.strategy,
    params.sectionLabel,
  );

  const signals = extractContentSignals(
    params.strategy,
    params.sectionLabel,
    sectionPurpose,
    params.contentNotes || params.structuredBrief,
  );

  const industryConcept =
    matchIndustryConcept(params.industryId, signals) ||
    matchIndustryConcept(params.industryId, `${params.purpose} ${sectionKey}`) ||
    matchIndustryConcept(params.ctx.industry, signals);

  const brandDirection =
    params.brandIdentity?.imageDirection ||
    params.ctx.brandImageDirection ||
    params.ctx.brandStyle;

  const defaultConcept =
    industryConcept ||
    DEFAULT_SECTION_CONCEPTS[sectionKey] ||
    `${params.ctx.industry} ${params.purpose} photography specific to ${params.ctx.projectName}`;

  const visualConcept = [
    defaultConcept,
    brandDirection ? `Brand direction: ${brandDirection}` : "",
    params.ctx.offer ? `Business offer context: ${params.ctx.offer}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  const subject = visualConcept.split(",")[0]?.trim() || defaultConcept;
  const scene = `${subject} — ${sectionPurpose}. Page goal: ${pagePurpose}. Industry: ${params.industryId}.`;

  return {
    subject,
    scene,
    storytellingRole: `Visually support "${sectionPurpose}" on ${params.sectionLabel || sectionKey} for ${pagePurpose}`,
    visualConcept,
    sectionPurpose,
    pagePurpose,
  };
}

/**
 * Apply semantic relevance to locked ImageSpecifications — rewrites subject/scene/prompt
 * so every image is aligned with section + page + industry + brand + content context.
 */
export function applySemanticRelevanceToSpecifications(
  specifications: ImageSpecification[],
  context: SemanticImageContext,
  structuredBriefs?: Map<string, string>,
): ImageSpecification[] {
  return specifications.map((spec) => {
    const structuredBrief = structuredBriefs?.get(spec.id);
    const semantic = resolveSemanticVisualConcept({
      industryId: context.policy.industryId,
      sectionLabel: spec.sectionLabel,
      sectionKey: spec.sectionKey,
      sectionPurpose: spec.sectionPurpose,
      contentNotes: structuredBrief,
      structuredBrief,
      purpose: spec.purpose,
      ctx: context.ctx,
      strategy: context.strategy,
      brandIdentity: context.brandIdentity,
    });

    const art = buildImageArtDirection({
      purpose: spec.purpose,
      ctx: context.ctx,
      brandIdentity: context.brandIdentity,
      sectionName: spec.sectionLabel,
    });

    const providerPrompt = composeImagePrompt({
      purpose: spec.purpose,
      ctx: context.ctx,
      sectionName: spec.sectionLabel,
      sectionKey: spec.sectionKey,
      shotBrief: semantic.visualConcept,
      contentNotes: `${semantic.sectionPurpose}. ${semantic.pagePurpose}`,
      artDirectionFragment: art.promptFragment,
    });

    const { alt, caption, seoDescription } = buildAccessibleAltText({
      ctx: context.ctx,
      purpose: spec.purpose,
      sectionName: spec.sectionLabel,
      sectionKey: spec.sectionKey,
      shotBrief: semantic.subject,
    });

    return {
      ...spec,
      subject: semantic.subject,
      scene: semantic.scene,
      storytellingRole: semantic.storytellingRole,
      visualConcept: semantic.visualConcept,
      sectionPurpose: semantic.sectionPurpose,
      pagePurpose: semantic.pagePurpose,
      providerPrompt,
      artDirectionSummary: art.summary,
      accessibility: {
        ...spec.accessibility,
        altText: alt,
        caption: caption || spec.accessibility.caption,
      },
      seo: {
        ...spec.seo,
        description: seoDescription || spec.seo.description,
        keywords: [
          ...new Set([
            ...spec.seo.keywords,
            context.policy.industryId,
            semantic.sectionPurpose.split(" ")[0] || "",
          ].filter(Boolean)),
        ],
      },
    };
  });
}

export function isGenericImageSpec(spec: Pick<
  ImageSpecification,
  "subject" | "scene" | "providerPrompt" | "visualConcept"
>): boolean {
  const hay = `${spec.subject} ${spec.scene} ${spec.providerPrompt} ${spec.visualConcept || ""}`.toLowerCase();
  if (GENERIC_IMAGE_PHRASES.some((p) => hay.includes(p))) return true;
  if (hay.includes("premium photography for website") && !spec.visualConcept) return true;
  if (hay.includes("industry business") || hay.includes("generic business")) return true;
  return false;
}

export function validateSemanticRelevance(
  specifications: ImageSpecification[],
  policy: ImagePolicy,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const spec of specifications) {
    if (isGenericImageSpec(spec)) {
      issues.push(`Spec ${spec.id} uses generic/unrelated imagery language`);
    }
    if (!spec.sectionPurpose?.trim()) {
      issues.push(`Spec ${spec.id} missing section purpose context`);
    }
    if (!spec.visualConcept?.trim()) {
      issues.push(`Spec ${spec.id} missing visual concept`);
    }
    const hay = `${spec.subject} ${spec.scene}`.toLowerCase();
    const industryToken = policy.industryId.toLowerCase();
    const hasIndustrySignal =
      hay.includes(industryToken) ||
      hay.includes(industryToken.replace("-", " ")) ||
      (spec.sectionPurpose && spec.sectionPurpose.length > 12);
    if (!hasIndustrySignal) {
      issues.push(`Spec ${spec.id} lacks industry/section semantic alignment`);
    }
  }

  return { valid: issues.length === 0, issues };
}
