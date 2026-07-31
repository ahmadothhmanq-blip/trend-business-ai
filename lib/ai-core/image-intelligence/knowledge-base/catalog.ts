import type { ImagePurpose } from "@/lib/ai-core/image-engine/types";
import type { ImageStylePreset } from "@/lib/ai-core/assets/settings";

export type ImageKnowledgeEntry = {
  id: string;
  industryId: string;
  version: string;
  requiredPurposes: ImagePurpose[];
  minImageCount: number;
  maxImageCount: number;
  defaultImageStyle: ImageStylePreset;
  photographyStyle: string[];
  forbiddenSubjects: string[];
  heroShotSeed: string;
  storytellingNotes: string[];
  compositionGuidelines: string[];
  lightingStrategy: string;
  cameraStrategy: string;
  colorHarmonyNotes: string[];
  accessibilityPolicies: string[];
  seoKeywordMinLength: number;
  aliases?: string[];
};

/** Image Knowledge Base — EDS-005 SSOT for industry image policies. */
export const IMAGE_KNOWLEDGE_ENTRIES: ImageKnowledgeEntry[] = [
  {
    id: "image-policy-furniture",
    industryId: "furniture",
    version: "1",
    requiredPurposes: ["hero", "product", "gallery", "section"],
    minImageCount: 4,
    maxImageCount: 14,
    defaultImageStyle: "luxury",
    photographyStyle: [
      "luxury showroom interior",
      "premium sofa in living room",
      "wood and metal material detail",
      "designer furniture staging",
    ],
    forbiddenSubjects: ["fashion", "clothing", "swimwear", "water splash"],
    heroShotSeed:
      "Wide luxury furniture showroom hero with flagship sofa, warm ambient lighting, editorial staging",
    storytellingNotes: [
      "Showroom catalog narrative",
      "Material craftsmanship close-ups",
      "Room-set lifestyle context",
    ],
    compositionGuidelines: [
      "Hero: full-bleed with negative space for headline",
      "Products: three-quarter angle with depth",
      "Gallery: varied crops, no duplicate hero framing",
    ],
    lightingStrategy: "warm premium ambient with soft key and metallic accents",
    cameraStrategy: "cinematic wide hero, product three-quarter, detail macro",
    colorHarmonyNotes: [
      "Warm neutrals with wood-metal accents",
      "Harmonize with locked brand palette",
    ],
    accessibilityPolicies: ["descriptive alt text", "no text in image"],
    seoKeywordMinLength: 80,
  },
  {
    id: "image-policy-ecommerce",
    industryId: "ecommerce",
    version: "1",
    requiredPurposes: ["hero", "product", "gallery", "background"],
    minImageCount: 4,
    maxImageCount: 14,
    defaultImageStyle: "modern",
    photographyStyle: [
      "product on clean surface",
      "lifestyle product in use",
      "packaging detail",
    ],
    forbiddenSubjects: ["watermark", "logo overlay"],
    heroShotSeed:
      "High-contrast product hero with decisive CTA space and clean background",
    storytellingNotes: ["Product-first conversion", "Trust and lifestyle context"],
    compositionGuidelines: [
      "Product grid priority",
      "Consistent shadow and surface treatment",
    ],
    lightingStrategy: "bright commercial product lighting with soft shadows",
    cameraStrategy: "eye-level product, lifestyle environmental",
    colorHarmonyNotes: ["High-contrast surfaces", "Accent CTA color harmony"],
    accessibilityPolicies: ["WCAG alt text", "product identification in alt"],
    seoKeywordMinLength: 80,
    aliases: ["retail", "store"],
  },
  {
    id: "image-policy-restaurant",
    industryId: "restaurant",
    version: "1",
    requiredPurposes: ["hero", "gallery", "section", "background"],
    minImageCount: 4,
    maxImageCount: 12,
    defaultImageStyle: "luxury",
    photographyStyle: [
      "signature dish close-up",
      "restaurant interior ambiance",
      "chef at work",
      "dining experience",
    ],
    forbiddenSubjects: ["fast food packaging", "generic stock smile"],
    heroShotSeed:
      "Full-bleed hero food photography with appetite-forward lighting and shallow depth",
    storytellingNotes: ["Culinary craft", "Ambiance and hospitality"],
    compositionGuidelines: [
      "Food hero dominates viewport",
      "Interior shots support reservation intent",
    ],
    lightingStrategy: "warm ambient with appetite-forward highlights",
    cameraStrategy: "overhead food, environmental dining wide",
    colorHarmonyNotes: ["Warm palette", "Food color pop against neutrals"],
    accessibilityPolicies: ["descriptive dish names in alt"],
    seoKeywordMinLength: 80,
  },
  {
    id: "image-policy-law",
    industryId: "law",
    version: "1",
    requiredPurposes: ["hero", "section", "testimonial", "background"],
    minImageCount: 3,
    maxImageCount: 10,
    defaultImageStyle: "corporate",
    photographyStyle: [
      "professional office environment",
      "confident attorney portrait",
      "law library detail",
    ],
    forbiddenSubjects: ["courtroom drama", "handcuffs", "crime scene"],
    heroShotSeed:
      "Authoritative law firm hero with trust-building office environment",
    storytellingNotes: ["Authority and trust", "Professional expertise"],
    compositionGuidelines: [
      "Conservative framing",
      "Clear focal subject with professional context",
    ],
    lightingStrategy: "bright professional with natural window light",
    cameraStrategy: "environmental wide hero, portrait mid-shot",
    colorHarmonyNotes: ["Trust blues and authoritative neutrals"],
    accessibilityPolicies: ["professional alt descriptions"],
    seoKeywordMinLength: 80,
    aliases: ["legal", "law-firm"],
  },
  {
    id: "image-policy-saas",
    industryId: "saas",
    version: "1",
    requiredPurposes: ["hero", "product", "section", "background"],
    minImageCount: 3,
    maxImageCount: 12,
    defaultImageStyle: "modern",
    photographyStyle: [
      "product UI on device",
      "team collaboration",
      "abstract tech gradient",
    ],
    forbiddenSubjects: ["outdated UI", "clipart"],
    heroShotSeed:
      "Product screenshot hero with clean gradient backdrop and UI clarity",
    storytellingNotes: ["Product capability", "Team productivity"],
    compositionGuidelines: [
      "UI legibility in hero",
      "Feature bento supporting shots",
    ],
    lightingStrategy: "clean product lighting with subtle cool rim",
    cameraStrategy: "straight-on product, environmental team mid-shot",
    colorHarmonyNotes: ["Bright surfaces with accent gradient harmony"],
    accessibilityPolicies: ["UI described in alt when product shown"],
    seoKeywordMinLength: 80,
  },
  {
    id: "image-policy-agency",
    industryId: "agency",
    version: "1",
    requiredPurposes: ["hero", "gallery", "section", "brand"],
    minImageCount: 4,
    maxImageCount: 14,
    defaultImageStyle: "cinematic",
    photographyStyle: [
      "creative studio environment",
      "portfolio case study",
      "bold editorial still",
    ],
    forbiddenSubjects: ["generic corporate handshake"],
    heroShotSeed:
      "Bold editorial agency hero with creative studio atmosphere",
    storytellingNotes: ["Portfolio storytelling", "Creative process"],
    compositionGuidelines: [
      "Asymmetric editorial crops",
      "Strong single-subject gallery frames",
    ],
    lightingStrategy: "expressive editorial with intentional contrast",
    cameraStrategy: "varied editorial angles, portrait and wide mix",
    colorHarmonyNotes: ["Bold studio palette with whitespace"],
    accessibilityPolicies: ["creative work described in alt"],
    seoKeywordMinLength: 80,
  },
  {
    id: "image-policy-default",
    industryId: "business",
    version: "1",
    requiredPurposes: ["hero", "section", "background"],
    minImageCount: 3,
    maxImageCount: 14,
    defaultImageStyle: "modern",
    photographyStyle: [
      "professional business environment",
      "team collaboration",
      "service delivery context",
    ],
    forbiddenSubjects: ["watermark", "logo overlay", "lorem ipsum text"],
    heroShotSeed:
      "Professional business hero with clear value proposition visual context",
    storytellingNotes: ["Clear value proposition", "Trust and capability"],
    compositionGuidelines: [
      "Hero with headline negative space",
      "Section-specific distinct subjects",
    ],
    lightingStrategy: "premium commercial lighting, balanced exposure",
    cameraStrategy: "wide hero, supporting mid-shots per section",
    colorHarmonyNotes: ["Harmonized brand palette with CTA contrast"],
    accessibilityPolicies: ["WCAG alt text", "no text overlays"],
    seoKeywordMinLength: 80,
    aliases: ["corporate", "company"],
  },
];

const byIndustry = new Map<string, ImageKnowledgeEntry>();
const aliasToId = new Map<string, string>();

for (const entry of IMAGE_KNOWLEDGE_ENTRIES) {
  byIndustry.set(entry.industryId, entry);
  aliasToId.set(entry.industryId, entry.industryId);
  for (const alias of entry.aliases ?? []) {
    aliasToId.set(alias.toLowerCase(), entry.industryId);
  }
}

export function getImageKnowledgeEntry(industryId: string): ImageKnowledgeEntry {
  const normalized = industryId.toLowerCase().trim().replace(/[_\s]+/g, "-");
  const resolved = aliasToId.get(normalized) ?? normalized;
  return byIndustry.get(resolved) ?? byIndustry.get("business")!;
}
