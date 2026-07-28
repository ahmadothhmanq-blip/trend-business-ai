/**
 * Industry-aware marketing copy packs for generated websites.
 * Improves headlines, CTAs, and service blurbs without rewriting invent.
 */

import { AR_PACKS } from "@/lib/ai-core/content/arabic-industry-copy";
import { resolveContentLanguage, usesLlmLocalizedWebsiteCopy, getStrategyFallbackLabels } from "@/lib/ai-core/content/content-language";
import { WEBSITE_INDUSTRY_INTELLIGENCE } from "@/lib/ai-core/industry-intelligence/profiles";
import { sanitizeCtaForIndustry } from "@/lib/ai-core/template-intelligence/industry-palettes";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { IndustryId } from "@/lib/ai-core/templates/types";

export type IndustryCopyPack = {
  industryId: IndustryId | string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCta: string;
  secondaryCta: string;
  serviceDescriptions: string[];
  trustLine: string;
  contentBlocks: string[];
};

const PACKS: Record<string, Omit<IndustryCopyPack, "industryId">> = {
  tourism: {
    heroHeadline: "Discover destinations worth the journey",
    heroSubheadline:
      "Handpicked tours, seamless booking, and local experts who turn travel plans into unforgettable trips.",
    primaryCta: "Explore destinations",
    secondaryCta: "Plan your trip",
    serviceDescriptions: [
      "Curated multi-day tours with transparent itineraries and small-group comfort.",
      "Flexible packages for couples, families, and corporate retreats.",
      "On-the-ground support from destination specialists before and during travel.",
    ],
    trustLine: "Trusted by travelers who value clarity, safety, and authentic experiences.",
    contentBlocks: [
      "Browse featured destinations with clear trip highlights and seasonal tips.",
      "Compare tour packages by duration, inclusions, and traveler style.",
      "Book with confidence — flexible dates and responsive travel advisors.",
    ],
  },
  restaurant: {
    heroHeadline: "Food made to be remembered",
    heroSubheadline:
      "Seasonal menus, warm hospitality, and a table worth reserving — whether it’s a weeknight dinner or a celebration.",
    primaryCta: "Reserve a table",
    secondaryCta: "View the menu",
    serviceDescriptions: [
      "Chef-driven menus that balance signature dishes with seasonal specials.",
      "Private dining and group bookings for milestones and business meals.",
      "Takeaway and catering options prepared with the same kitchen standard.",
    ],
    trustLine: "Loved locally for consistent quality, atmosphere, and attentive service.",
    contentBlocks: [
      "Explore starters, mains, and desserts crafted for sharing and savoring.",
      "Reserve online in minutes — confirmations arrive instantly.",
      "Find us easily with map directions, hours, and parking notes.",
    ],
  },
  "real-estate": {
    heroHeadline: "Homes that match how you want to live",
    heroSubheadline:
      "Browse verified listings, get clear guidance, and move from inquiry to keys with a team that knows the market.",
    primaryCta: "Browse listings",
    secondaryCta: "Request a valuation",
    serviceDescriptions: [
      "Buy and sell support with local pricing insight and negotiation expertise.",
      "Property viewings scheduled around your timeline — virtual or in person.",
      "Rental and investment options screened for quality and location fit.",
    ],
    trustLine: "Transparent process, responsive agents, and listings you can trust.",
    contentBlocks: [
      "Search homes by neighborhood, budget, and must-have features.",
      "Submit an inquiry and get a same-day response from a dedicated agent.",
      "See recent sales and market notes that keep decisions grounded.",
    ],
  },
  saas: {
    heroHeadline: "Software that moves your business forward",
    heroSubheadline:
      "Clear product value, practical features, and onboarding that gets teams productive — without the enterprise maze.",
    primaryCta: "Book a demo",
    secondaryCta: "See pricing",
    serviceDescriptions: [
      "Core workflows designed for speed: less busywork, more outcomes.",
      "Integrations and automation that fit how your team already works.",
      "Security-minded infrastructure with roles, auditability, and reliability.",
    ],
    trustLine: "Built for modern teams that need clarity, speed, and measurable ROI.",
    contentBlocks: [
      "See features mapped to real jobs-to-be-done, not buzzwords.",
      "Compare plans with transparent pricing and upgrade paths.",
      "Start with a guided demo tailored to your use case.",
    ],
  },
  ecommerce: {
    heroHeadline: "Shop products people come back for",
    heroSubheadline:
      "Curated collections, clear offers, and checkout that feels effortless from first click to delivery updates.",
    primaryCta: "Shop now",
    secondaryCta: "View offers",
    serviceDescriptions: [
      "Featured collections refreshed with seasonal bestsellers and new arrivals.",
      "Secure checkout with clear shipping timelines and return guidance.",
      "Customer support that resolves order questions quickly and clearly.",
    ],
    trustLine: "Quality products, honest pricing, and delivery you can track.",
    contentBlocks: [
      "Discover bestsellers with sharp product stories and clear specs.",
      "Unlock limited-time offers without confusing coupons or fine print.",
      "Checkout in a few steps — confirmation and tracking included.",
    ],
  },
  automotive: {
    heroHeadline: "Drive the vehicle that fits your life",
    heroSubheadline:
      "Browse inventory with transparent specs, book a test drive, and get financing guidance without the pressure.",
    primaryCta: "View inventory",
    secondaryCta: "Book a test drive",
    serviceDescriptions: [
      "New and certified pre-owned vehicles inspected to a clear standard.",
      "Test drives scheduled around your day — on-site or delivery options.",
      "Service and maintenance plans that keep ownership predictable.",
    ],
    trustLine: "Honest pricing, detailed vehicle history, and advisors who listen.",
    contentBlocks: [
      "Filter inventory by make, model, budget, and availability.",
      "Request a quote with trade-in and financing estimates.",
      "Visit the showroom or schedule a consultation online.",
    ],
  },
  clinic: {
    heroHeadline: "Care that puts patients first",
    heroSubheadline:
      "Expert clinicians, clear treatment plans, and booking that respects your time — from first visit to follow-up.",
    primaryCta: "Book appointment",
    secondaryCta: "Our services",
    serviceDescriptions: [
      "Comprehensive consultations with explanations you can understand.",
      "Preventive and specialized care coordinated under one roof.",
      "Follow-up pathways designed for continuity, not one-off visits.",
    ],
    trustLine: "Patient-centered care with modern facilities and trusted clinicians.",
    contentBlocks: [
      "Learn about services, specialties, and what to expect on your visit.",
      "Book online with preferred times and confirmation reminders.",
      "Meet the care team and review credentials before you arrive.",
    ],
  },
  education: {
    heroHeadline: "Learn skills that open real opportunities",
    heroSubheadline:
      "Programs built around outcomes — expert instructors, practical projects, and a clear path from enrollment to results.",
    primaryCta: "Explore programs",
    secondaryCta: "Apply now",
    serviceDescriptions: [
      "Career-focused courses with structured curricula and mentor feedback.",
      "Flexible learning formats for working professionals and full-time students.",
      "Admissions support that clarifies requirements, deadlines, and next steps.",
    ],
    trustLine: "Practical education designed for measurable progress and confidence.",
    contentBlocks: [
      "Browse programs by goal, duration, and skill level.",
      "See outcomes, project examples, and instructor backgrounds.",
      "Start your application with a guided admissions checklist.",
    ],
  },
  law: {
    heroHeadline: "Legal counsel you can trust",
    heroSubheadline:
      "Experienced attorneys across practice areas — clear guidance, discreet representation, and responsive consultation.",
    primaryCta: "Book consultation",
    secondaryCta: "Practice areas",
    serviceDescriptions: [
      "Corporate, family, and immigration matters handled with precision.",
      "Case strategy explained in plain language before you commit.",
      "Consultations scheduled around your timeline and confidentiality needs.",
    ],
    trustLine: "Professional legal representation with discretion and accountability.",
    contentBlocks: [
      "Review practice areas and representative case outcomes.",
      "Meet the attorneys leading your matter.",
      "Request a confidential consultation online.",
    ],
  },
  blog: {
    heroHeadline: "Stories, insights, and ideas worth your time",
    heroSubheadline:
      "Editorial-quality articles across the topics you care about — written for clarity, depth, and practical value.",
    primaryCta: "Read latest",
    secondaryCta: "Subscribe",
    serviceDescriptions: [
      "Featured articles curated for relevance and quality.",
      "Browse by category, author, or trending topics.",
      "Newsletter digests delivered on your schedule.",
    ],
    trustLine: "Independent editorial voice with consistent publishing quality.",
    contentBlocks: [
      "Explore featured and popular posts from our writers.",
      "Subscribe for new articles and exclusive commentary.",
      "Meet the authors behind the publication.",
    ],
  },
  "landing-page": {
    heroHeadline: "Launch faster. Convert better.",
    heroSubheadline:
      "A focused landing experience that communicates value, builds trust, and drives signups — without distracting navigation.",
    primaryCta: "Get started",
    secondaryCta: "Book a demo",
    serviceDescriptions: [
      "Benefit-led hero with a single primary conversion goal.",
      "Social proof, metrics, and pricing that reduce hesitation.",
      "FAQ and objection handling directly on the page.",
    ],
    trustLine: "Built for campaigns, product launches, and lead generation.",
    contentBlocks: [
      "See benefits and features mapped to outcomes.",
      "Compare plans or offers with transparent pricing.",
      "Start a trial or join the waitlist in one click.",
    ],
  },
  agency: {
    heroHeadline: "Creative work that grows brands",
    heroSubheadline:
      "Strategy, design, and campaigns crafted to look premium and perform — with a process clients can trust.",
    primaryCta: "Start a project",
    secondaryCta: "View case studies",
    serviceDescriptions: [
      "Brand systems and digital experiences built for clarity and conversion.",
      "Campaigns and content that keep messaging consistent across channels.",
      "Collaborative delivery with milestones, reviews, and measurable KPIs.",
    ],
    trustLine: "A partner for teams who need craft, pace, and accountable results.",
    contentBlocks: [
      "See how we approach discovery, creative direction, and launch.",
      "Review selected work across industries and formats.",
      "Tell us your goals — we’ll propose a clear engagement plan.",
    ],
  },
  business: {
    heroHeadline: "A professional presence that earns trust",
    heroSubheadline:
      "Clear messaging, polished design, and conversion-focused pages that help visitors understand your offer and take the next step.",
    primaryCta: "Get a quote",
    secondaryCta: "Contact us",
    serviceDescriptions: [
      "Core services explained in plain language with outcomes, not jargon.",
      "Proof points and process steps that reduce hesitation for new clients.",
      "Responsive follow-up paths — forms, calls, and consultation booking.",
    ],
    trustLine: "Built for businesses that want to look established and convert faster.",
    contentBlocks: [
      "Highlight what you do, who you help, and why you’re the right choice.",
      "Present services with clear scopes and next-step CTAs.",
      "Make contact effortless with a direct inquiry path.",
    ],
  },
};

function isIndustryId(value: string): value is IndustryId {
  return value in WEBSITE_INDUSTRY_INTELLIGENCE;
}

export function resolveCopyIndustryId(
  industryId?: string | null,
  profile?: CoreBusinessProfile | null,
): IndustryId | string {
  if (industryId && isIndustryId(industryId)) return industryId;
  const raw = (profile?.industry || "").toLowerCase().replace(/[_\s]+/g, "-");
  if (raw && isIndustryId(raw)) return raw;
  if (raw.includes("tour") || raw.includes("travel")) return "tourism";
  if (raw.includes("restaurant") || raw.includes("food")) return "restaurant";
  if (raw.includes("real") || raw.includes("estate") || raw.includes("property")) {
    return "real-estate";
  }
  if (raw.includes("saas") || raw.includes("software") || raw.includes("technology")) {
    return "saas";
  }
  if (raw.includes("shop") || raw.includes("ecom") || raw.includes("store")) {
    return "ecommerce";
  }
  if (
    raw.includes("automotive") ||
    raw.includes("dealership") ||
    /\bcar\b/.test(raw) ||
    raw.includes("vehicle")
  ) {
    return "automotive";
  }
  if (raw.includes("clinic") || raw.includes("health") || raw.includes("medical")) {
    return "clinic";
  }
  if (raw.includes("law") || raw.includes("legal") || raw.includes("attorney")) {
    return "law";
  }
  if (raw.includes("blog") || raw.includes("article") || raw.includes("magazine")) {
    return "blog";
  }
  if (raw.includes("landing") || raw.includes("launch") || raw.includes("campaign")) {
    return "landing-page";
  }
  if (raw.includes("school") || raw.includes("education")) return "education";
  if (raw.includes("agency") || raw.includes("studio")) return "agency";
  return "business";
}

/**
 * Build personalized industry copy using brand/offer when available.
 */
export function buildIndustryCopyPack(params: {
  industryId?: string | null;
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  language?: string | null;
}): IndustryCopyPack {
  const industryId = resolveCopyIndustryId(params.industryId, params.profile);
  if (usesLlmLocalizedWebsiteCopy(params.language)) {
    return {
      industryId,
      heroHeadline: "",
      heroSubheadline: "",
      primaryCta: "",
      secondaryCta: "",
      serviceDescriptions: [],
      trustLine: "",
      contentBlocks: [],
    };
  }
  const lang = resolveContentLanguage(params.language);
  const packSource = lang === "ar" ? AR_PACKS : PACKS;
  const base = packSource[String(industryId)] ?? packSource.business;
  const brand = params.profile?.projectName?.trim();
  const offer = params.profile?.offer?.trim();
  const geography = params.profile?.geography?.trim();
  const positioning = params.strategy?.positioning?.trim();
  const strategyCta = params.strategy?.ctas?.[0]?.trim();

  const heroHeadline =
    brand && lang === "ar"
      ? `${brand} — ${base.heroHeadline}`
      : brand
        ? `${brand} — ${base.heroHeadline.charAt(0).toLowerCase()}${base.heroHeadline.slice(1)}`
        : base.heroHeadline;

  const geographySuffix =
    lang === "ar"
      ? geography
        ? ` · نخدم ${geography}`
        : ""
      : geography
        ? ` · Serving ${geography}`
        : "";

  const heroSubheadline =
    positioning ||
    (offer
      ? `${offer}${geographySuffix}. ${base.heroSubheadline}`
      : base.heroSubheadline);

  return {
    industryId,
    heroHeadline: heroHeadline.slice(0, 90),
    heroSubheadline: heroSubheadline.slice(0, 220),
    primaryCta: sanitizeCtaForIndustry(strategyCta || base.primaryCta, industryId),
    secondaryCta: sanitizeCtaForIndustry(
      params.strategy?.ctas?.[1] || base.secondaryCta,
      industryId,
    ),
    serviceDescriptions: base.serviceDescriptions,
    trustLine: base.trustLine,
    contentBlocks: [
      ...base.contentBlocks,
      ...base.serviceDescriptions,
      base.trustLine,
    ],
  };
}

/** Enrich strategy CTAs / structure with industry copy (non-destructive). */
export function enrichStrategyWithIndustryCopy(
  strategy: CoreProductStrategy,
  profile?: CoreBusinessProfile | null,
  industryId?: string | null,
  language?: string | null,
): CoreProductStrategy {
  if (usesLlmLocalizedWebsiteCopy(language)) {
    const labels = getStrategyFallbackLabels(language);
    const next = { ...strategy };
    if (!next.contentStructure?.length) {
      next.contentStructure = labels.sections;
    }
    return next;
  }

  const pack = buildIndustryCopyPack({ industryId, profile, strategy, language });
  const next = { ...strategy };

  if (!next.ctas?.length) {
    next.ctas = [pack.primaryCta, pack.secondaryCta];
  } else if (next.ctas.length === 1) {
    next.ctas = [next.ctas[0], pack.secondaryCta];
  }

  if (!next.positioning?.trim() || next.positioning.length < 40) {
    next.positioning = pack.heroSubheadline;
  }

  if (!next.contentStructure?.length) {
    next.contentStructure = [
      "Hero",
      "Services",
      "Social proof",
      "CTA",
      "Contact",
    ];
  }

  if (next.pages?.length) {
    next.pages = next.pages.map((page, index) => ({
      ...page,
      primaryCta:
        page.primaryCta ||
        (index === 0 ? pack.primaryCta : pack.secondaryCta),
      purpose:
        page.purpose?.trim() ||
        (index === 0 ? pack.heroSubheadline : page.purpose),
    }));
  }

  return next;
}

/** Content strings for static preview / blueprint content array. */
export function industryContentForPreview(pack: IndustryCopyPack): string[] {
  return [
    pack.heroSubheadline,
    ...pack.serviceDescriptions,
    ...pack.contentBlocks.slice(0, 4),
    pack.trustLine,
  ];
}
