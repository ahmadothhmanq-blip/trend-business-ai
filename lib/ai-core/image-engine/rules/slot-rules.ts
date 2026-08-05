import { IMAGE_SLOT_KINDS, type ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import { INDUSTRY_IMAGE_PROFILES } from "@/lib/ai-core/image-engine/profiles/data";
import type { IndustrySlotRules, SlotImageRule } from "@/lib/ai-core/image-engine/rules/types";
import { slotOrientationForKind } from "@/lib/ai-core/image-engine/rules/detect-context";

/** Cross-industry forbidden subjects — never allow in any industry slot. */
const GLOBAL_FORBIDDEN = [
  "placeholder",
  "lorem",
  "dummy",
  "clipart",
  "watermark",
  "screenshot",
  "meme",
];

/** Per-industry forbidden subjects that indicate wrong industry imagery. */
const INDUSTRY_FORBIDDEN: Record<string, string[]> = {
  medical: ["food", "restaurant", "gaming", "esports", "cocktail", "burger"],
  restaurant: ["hospital", "surgery", "clinic", "gaming", "esports", "courtroom"],
  finance: ["burger", "pizza", "gaming", "workout", "gym"],
  education: ["cocktail", "bar", "nightclub", "casino"],
  hotel: ["construction", "hardhat", "courtroom"],
  "real-estate": ["food platter", "surgery", "gaming"],
  gaming: ["hospital", "courtroom", "fine dining", "surgery"],
  automotive: ["food platter", "hospital", "classroom"],
  law: ["gaming", "esports", "burger", "pizza"],
  beauty: ["construction", "automotive", "courtroom"],
  fitness: ["burger", "pizza", "dessert", "cocktail"],
  construction: ["spa", "makeup", "fine dining"],
  travel: ["office cubicle", "courtroom"],
  fashion: ["construction", "automotive repair", "hospital"],
  saas: ["food platter", "spa treatment"],
  corporate: ["gaming neon", "burger", "cocktail"],
  ecommerce: ["hospital", "courtroom"],
  "creative-agency": ["hospital", "surgery"],
};

/** Slot-specific subject hints per industry. */
const SLOT_SUBJECT_HINTS: Partial<Record<string, Partial<Record<ImageSlotKind, string[]>>>> = {
  restaurant: {
    hero: ["dining", "restaurant", "chef", "table", "cuisine"],
    products: ["dish", "food", "plate", "menu", "cuisine"],
    gallery: ["food", "dining", "kitchen", "restaurant"],
    testimonials: ["diner", "guest", "patron"],
    cta: ["reservation", "dining", "restaurant"],
  },
  medical: {
    hero: ["clinic", "healthcare", "medical", "doctor", "hospital"],
    team: ["doctor", "physician", "nurse", "clinician"],
    about: ["care", "clinic", "wellness", "health"],
    testimonials: ["patient", "care"],
    cta: ["appointment", "clinic", "healthcare"],
  },
  hotel: {
    hero: ["resort", "hotel", "pool", "suite", "lobby"],
    gallery: ["resort", "hotel", "spa", "suite", "beach"],
    products: ["suite", "room", "amenity"],
    cta: ["reservation", "book", "resort"],
  },
  "real-estate": {
    hero: ["property", "home", "estate", "architecture", "interior"],
    products: ["listing", "property", "home", "interior"],
    gallery: ["property", "architecture", "interior", "home"],
    cta: ["property", "listing", "tour"],
  },
  finance: {
    hero: ["finance", "banking", "wealth", "office", "advisory"],
    team: ["advisor", "executive", "professional"],
    features: ["data", "analytics", "chart", "investment"],
    cta: ["consultation", "wealth", "advisory"],
  },
  education: {
    hero: ["campus", "university", "students", "academy", "learning"],
    gallery: ["campus", "classroom", "students", "library"],
    team: ["professor", "teacher", "faculty", "educator"],
    cta: ["admissions", "enroll", "apply"],
  },
  ecommerce: {
    hero: ["retail", "store", "product", "shopping", "commerce"],
    products: ["product", "merchandise", "retail", "fashion"],
    gallery: ["product", "lifestyle", "retail"],
    cta: ["shop", "buy", "collection"],
  },
  saas: {
    hero: ["software", "technology", "dashboard", "team", "office"],
    features: ["interface", "dashboard", "analytics", "product"],
    products: ["software", "platform", "dashboard"],
    cta: ["demo", "trial", "platform"],
  },
  corporate: {
    hero: ["corporate", "executive", "office", "business", "team"],
    team: ["executive", "professional", "business"],
    about: ["strategy", "consulting", "corporate"],
    cta: ["consultation", "contact", "advisory"],
  },
  gaming: {
    hero: ["gaming", "esports", "controller", "neon", "arena"],
    products: ["game", "gaming", "esports"],
    gallery: ["gaming", "esports", "stream"],
    cta: ["play", "game", "join"],
  },
  automotive: {
    hero: ["car", "vehicle", "automotive", "showroom", "drive"],
    products: ["car", "vehicle", "automotive"],
    gallery: ["car", "vehicle", "automotive", "showroom"],
    cta: ["test drive", "dealer", "vehicle"],
  },
  beauty: {
    hero: ["spa", "beauty", "salon", "skincare", "wellness"],
    products: ["cosmetic", "skincare", "beauty", "product"],
    gallery: ["spa", "beauty", "salon", "treatment"],
    cta: ["book", "spa", "appointment"],
  },
  fitness: {
    hero: ["gym", "fitness", "workout", "training", "athletic"],
    team: ["trainer", "coach", "athlete"],
    gallery: ["gym", "workout", "fitness", "training"],
    cta: ["join", "membership", "train"],
  },
  law: {
    hero: ["law", "legal", "courtroom", "attorney", "office"],
    team: ["attorney", "lawyer", "legal"],
    about: ["law", "legal", "justice"],
    cta: ["consultation", "legal", "attorney"],
  },
  construction: {
    hero: ["construction", "building", "site", "architecture", "contractor"],
    gallery: ["construction", "building", "site", "project"],
    features: ["construction", "building", "engineering"],
    cta: ["quote", "project", "build"],
  },
  travel: {
    hero: ["travel", "destination", "landscape", "adventure", "journey"],
    gallery: ["travel", "destination", "landscape", "adventure"],
    products: ["tour", "package", "destination"],
    cta: ["book", "travel", "explore"],
  },
  fashion: {
    hero: ["fashion", "runway", "style", "editorial", "boutique"],
    products: ["fashion", "apparel", "clothing", "accessory"],
    gallery: ["fashion", "style", "editorial", "boutique"],
    cta: ["shop", "collection", "style"],
  },
  "creative-agency": {
    hero: ["creative", "studio", "design", "agency", "portfolio"],
    gallery: ["creative", "design", "studio", "work"],
    team: ["designer", "creative", "director"],
    cta: ["project", "studio", "collaborate"],
  },
};

function buildSlotRule(industryId: string, kind: ImageSlotKind): SlotImageRule {
  const hints = SLOT_SUBJECT_HINTS[industryId]?.[kind] ?? [];
  const profile = INDUSTRY_IMAGE_PROFILES.find((p) => p.id === industryId);
  const industryTokens = [
    industryId,
    ...(profile?.aliases ?? []),
    ...(profile?.subcategories ?? []),
  ];

  return {
    kind,
    allowedSubjects: hints.length ? hints : industryTokens,
    forbiddenSubjects: [
      ...GLOBAL_FORBIDDEN,
      ...(INDUSTRY_FORBIDDEN[industryId] ?? []),
    ],
    orientation: slotOrientationForKind(kind),
    minWidth: kind === "hero" || kind === "backgrounds" || kind === "cta" ? 1200 : 600,
  };
}

const RULES_CACHE = new Map<string, IndustrySlotRules>();

export function getIndustrySlotRules(industryId: string): IndustrySlotRules {
  const cached = RULES_CACHE.get(industryId);
  if (cached) return cached;

  const profile = INDUSTRY_IMAGE_PROFILES.find((p) => p.id === industryId);
  const slots = Object.fromEntries(
    IMAGE_SLOT_KINDS.map((kind) => [kind, buildSlotRule(industryId, kind)]),
  ) as Record<ImageSlotKind, SlotImageRule>;

  const rules: IndustrySlotRules = {
    industryId,
    subcategories: profile?.subcategories ?? [],
    visualStyle: profile?.visualStyle ?? "professional editorial",
    slots,
  };
  RULES_CACHE.set(industryId, rules);
  return rules;
}

export function listSupportedIndustryRules(): string[] {
  return INDUSTRY_IMAGE_PROFILES.map((p) => p.id);
}
