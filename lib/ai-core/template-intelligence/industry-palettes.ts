import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import { usesLlmLocalizedWebsiteCopy } from "@/lib/i18n/website-output-locale";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import type { TemplateIntelligenceDefinition } from "@/lib/ai-core/template-intelligence/types";
import { resolveTemplateDNA } from "@/lib/ai-core/template-intelligence/template-dna";

export type VerticalPaletteId =
  | "technology"
  | "saas"
  | "automotive"
  | "tourism"
  | "restaurant"
  | "real-estate"
  | "medical"
  | "law"
  | "education"
  | "blog"
  | "landing"
  | "generic";

function comps(
  ...ids: DesignRendererComponentId[]
): DesignRendererComponentId[] {
  return ids;
}

/** Software / AI / Technology — product narrative, not vehicle or dining flows. */
export const PALETTE_TECHNOLOGY = comps(
  "NavModern",
  "HeroInteractive",
  "ServicesModern",
  "FeaturesBento",
  "CaseStudies",
  "IntegrationsLogoCloud",
  "BrandTrust",
  "TestimonialsSlider",
  "CtaBand",
  "ContactCta",
  "SiteFooter",
);

/** SaaS — conversion-focused product marketing. */
export const PALETTE_SAAS = comps(
  "NavModern",
  "HeroProduct",
  "FeaturesModern",
  "PricingModern",
  "IntegrationsLogoCloud",
  "FaqAccordion",
  "CtaSplit",
  "ContactCta",
  "SiteFooter",
);

/** Automotive — showroom, inventory, finance, appointments. */
export const PALETTE_AUTOMOTIVE = comps(
  "SiteHeaderTransparent",
  "HeroLuxuryShowcase",
  "VehicleShowcase",
  "InventoryGrid",
  "VehicleComparison",
  "FinanceCalculator",
  "AppointmentCalendar",
  "TestimonialsSlider",
  "BookingCta",
  "SiteFooter",
);

/** Tourism / travel — destinations, packages, booking, experiences. */
export const PALETTE_TOURISM = comps(
  "SiteHeaderTransparent",
  "HeroFullBleed",
  "DestinationsGallery",
  "TourPackagesGrid",
  "BookingSection",
  "TestimonialsCarousel",
  "TravelCtaBand",
  "FaqAccordion",
  "ContactCta",
  "SiteFooter",
);

/** Restaurant — menu, gallery, chef story, reservations. */
export const PALETTE_RESTAURANT = comps(
  "SiteHeaderTransparent",
  "HeroCinematic",
  "MenuHighlights",
  "GalleryExperience",
  "FeatureStorytelling",
  "ReservationSection",
  "TestimonialsSlider",
  "MapsSection",
  "ContactCta",
  "SiteFooter",
);

/** Real estate — listings, locations, agents, inquiry. */
export const PALETTE_REAL_ESTATE = comps(
  "SiteHeader",
  "HeroProperty",
  "PropertyListings",
  "LocationSections",
  "TeamSection",
  "TestimonialsModern",
  "ContactSection",
  "SiteFooter",
);

/** Medical — care services, doctors, appointments, emergency. */
export const PALETTE_MEDICAL = comps(
  "SiteHeader",
  "HeroSplit",
  "CareServices",
  "ServicesModern",
  "DoctorProfiles",
  "BookingForm",
  "FaqAccordion",
  "MapsSection",
  "TestimonialsModern",
  "ContactCta",
  "SiteFooter",
);

/** Law — practice areas, attorneys, cases, consultation. */
export const PALETTE_LAW = comps(
  "SiteHeaderTransparent",
  "HeroLuxury",
  "ServicesModern",
  "TeamSection",
  "CaseStudies",
  "TestimonialsSlider",
  "BookingForm",
  "FaqAccordion",
  "MapsSection",
  "CtaSplit",
  "SiteFooter",
);

/** Education — programs, courses, faculty, admissions. */
export const PALETTE_EDUCATION = comps(
  "SiteHeader",
  "HeroSplit",
  "ProgramsGrid",
  "ProductShowcase",
  "TeamSection",
  "FeaturesModern",
  "GalleryGrid",
  "TestimonialsCarousel",
  "AdmissionsCta",
  "BlogSection",
  "ContactSection",
  "SiteFooter",
);

/** Blog — editorial articles, categories, newsletter. */
export const PALETTE_BLOG = comps(
  "NavModern",
  "HeroSplit",
  "BlogSection",
  "FeatureHighlights",
  "ProductShowcase",
  "TeamSection",
  "CtaSplit",
  "ContactSection",
  "SiteFooter",
);

/** Landing page — conversion hero, benefits, pricing, sticky CTA. */
export const PALETTE_LANDING = comps(
  "NavModern",
  "HeroProduct",
  "FeatureHighlights",
  "FeaturesModern",
  "BrandTrust",
  "TestimonialsModern",
  "PricingModern",
  "FaqAccordion",
  "CtaBand",
  "ContactCta",
  "SiteFooter",
);

/** Cafe — morning ritual, menu, community, reservations. */
export const PALETTE_CAFE = comps(
  "NavModern",
  "HeroSplit",
  "FeatureStorytelling",
  "MenuHighlights",
  "GalleryGrid",
  "TestimonialsCarousel",
  "ReservationSection",
  "MapsSection",
  "ContactCta",
  "SiteFooter",
);

/** Architecture — monograph projects, process, inquiry. */
export const PALETTE_ARCHITECTURE = comps(
  "SiteHeaderTransparent",
  "HeroCinematic",
  "CaseStudies",
  "GalleryExperience",
  "FeatureStorytelling",
  "ProcessSteps",
  "TeamSection",
  "CtaSplit",
  "ContactSection",
  "SiteFooterEditorial",
);

/** Construction — capabilities, safety, projects, bids. */
export const PALETTE_CONSTRUCTION = comps(
  "SiteHeader",
  "HeroSplit",
  "ServicesModern",
  "TimelineSection",
  "CaseStudies",
  "BrandTrust",
  "ProcessSteps",
  "TestimonialsModern",
  "ContactSection",
  "SiteFooter",
);

/** Dental — treatments, doctors, booking, trust. */
export const PALETTE_DENTAL = comps(
  "SiteHeader",
  "HeroFullBleed",
  "CareServices",
  "DoctorProfiles",
  "ServicesGrid",
  "TestimonialsModern",
  "BookingForm",
  "FaqAccordion",
  "MapsSection",
  "ContactCta",
  "SiteFooter",
);

/** Pharmacy — wellness lanes, pharmacist trust, services. */
export const PALETTE_PHARMACY = comps(
  "SiteHeader",
  "HeroSplit",
  "CareServices",
  "ServicesModern",
  "FeatureHighlights",
  "BrandTrust",
  "BookingForm",
  "FaqAccordion",
  "MapsSection",
  "ContactCta",
  "SiteFooter",
);

/** Insurance — plans, advisors, claims, quotes. */
export const PALETTE_INSURANCE = comps(
  "SiteHeader",
  "HeroSplit",
  "ServicesModern",
  "PricingModern",
  "TeamSection",
  "BrandTrust",
  "FaqAccordion",
  "TestimonialsModern",
  "ContactSection",
  "SiteFooter",
);

/** University — schools, research, campus life, admissions. */
export const PALETTE_UNIVERSITY = comps(
  "SiteHeaderTransparent",
  "HeroCinematic",
  "ProgramsGrid",
  "FeatureStorytelling",
  "GalleryExperience",
  "TeamSection",
  "BlogSection",
  "AdmissionsCta",
  "ContactSection",
  "SiteFooter",
);

/** Beauty — rituals, treatments, products, booking. */
export const PALETTE_BEAUTY = comps(
  "SiteHeaderTransparent",
  "HeroLuxury",
  "FeatureStorytelling",
  "GalleryExperience",
  "ServicesModern",
  "ProductShowcase",
  "TestimonialsSlider",
  "BookingForm",
  "CtaSplit",
  "SiteFooterEditorial",
);

/** Fitness — programs, trainers, schedules, membership. */
export const PALETTE_FITNESS = comps(
  "NavModern",
  "HeroInteractive",
  "FeaturesBento",
  "ServicesModern",
  "TeamSection",
  "PricingModern",
  "TestimonialsModern",
  "CtaBand",
  "BookingForm",
  "SiteFooter",
);

/** Logistics — fleet, routes, tracking, quotes. */
export const PALETTE_LOGISTICS = comps(
  "SiteHeader",
  "HeroSplit",
  "ServicesModern",
  "TimelineSection",
  "BrandTrust",
  "IntegrationsLogoCloud",
  "CaseStudies",
  "ContactSection",
  "MapsSection",
  "SiteFooter",
);

/** Manufacturing — capabilities, quality, certifications, RFQ. */
export const PALETTE_MANUFACTURING = comps(
  "SiteHeader",
  "HeroProduct",
  "FeaturesModern",
  "ProcessSteps",
  "BrandTrust",
  "CaseStudies",
  "IntegrationsLogoCloud",
  "TestimonialsModern",
  "ContactSection",
  "SiteFooter",
);

/** Nonprofit — mission, impact, volunteer, donate. */
export const PALETTE_NONPROFIT = comps(
  "SiteHeader",
  "HeroFullBleed",
  "FeatureStorytelling",
  "TimelineSection",
  "TeamSection",
  "TestimonialsCarousel",
  "GalleryGrid",
  "CtaBand",
  "ContactCta",
  "SiteFooter",
);

export const AUTOMOTIVE_ONLY_COMPONENTS: DesignRendererComponentId[] = [
  "HeroLuxuryShowcase",
  "VehicleShowcase",
  "VehicleDetail",
  "VehicleComparison",
  "InventoryGrid",
  "FinanceCalculator",
  "AppointmentCalendar",
  "BranchesMap",
  "BookingCta",
];

export const RESTAURANT_ONLY_COMPONENTS: DesignRendererComponentId[] = [
  "MenuHighlights",
  "ReservationSection",
];

export const SOFTWARE_SIGNALS = [
  "software",
  "saas",
  "ai ",
  "artificial intelligence",
  "machine learning",
  "developer",
  "api ",
  "platform",
  "tech stack",
  "cloud",
  "startup",
  "b2b software",
  "tech company",
  "ml ",
  "data platform",
];

export const TOURISM_SIGNALS = [
  "tourism",
  "travel",
  "destination",
  "vacation",
  "itinerary",
  "resort",
  "hotel",
  "cruise",
  "safari",
  "airline",
  "adventure",
  "tour package",
  "honeymoon",
  "backpack",
];

export const AUTOMOTIVE_SIGNALS = [
  "automotive",
  "dealership",
  "vehicle",
  "car ",
  " ev ",
  "test drive",
  "garage",
  "motors",
  "showroom",
  "inventory",
];

/** True when prompt/industry text describes travel & tourism (blocks automotive bleed). */
export function isTourismContext(text: string): boolean {
  const hay = text.toLowerCase();
  if (TOURISM_SIGNALS.some((s) => hay.includes(s))) return true;
  return (
    /\btravel\b/.test(hay) ||
    /\btour(s)?\b/.test(hay) ||
    /\btrip(s)?\b/.test(hay) ||
    /\bholiday(s)?\b/.test(hay)
  );
}

/** Automotive only when signals are present and tourism context is absent. */
export function isAutomotiveContext(text: string): boolean {
  const hay = text.toLowerCase();
  if (isTourismContext(hay)) return false;
  if (SOFTWARE_SIGNALS.some((s) => hay.includes(s))) return false;
  if (hay.includes("showroom") && !/\b(vehicle|car|dealer|auto|motor|ev|garage)\b/.test(hay)) {
    return false;
  }
  if (hay.includes("inventory") && /\b(tour|travel|package|destination|hotel)\b/.test(hay)) {
    return false;
  }
  return AUTOMOTIVE_SIGNALS.some((s) => hay.includes(s));
}

export const RESTAURANT_SIGNALS = [
  "restaurant",
  "dining",
  "bistro",
  "cafe",
  "chef",
  "menu",
  "reserve a table",
  "hospitality",
];

/** CTAs that must only appear for their vertical. */
export const INDUSTRY_EXCLUSIVE_CTAS: Record<string, string[]> = {
  automotive: ["book a test drive", "book test drive", "view inventory"],
  restaurant: ["reserve a table", "view the menu", "private events"],
};

const DEFAULT_PRIMARY_CTA: Record<string, string> = {
  automotive: "Book a test drive",
  restaurant: "Reserve a table",
  saas: "Book a demo",
  technology: "Book a demo",
  "real-estate": "Browse listings",
  medical: "Book appointment",
  law: "Book consultation",
  education: "Apply now",
  blog: "Subscribe",
  landing: "Get started",
  business: "Get started",
};

const SECTION_LABELS: Record<
  VerticalPaletteId,
  Partial<Record<DesignRendererComponentId, string>>
> = {
  technology: {
    HeroInteractive: "Hero",
    ServicesModern: "Services",
    FeaturesBento: "Solutions",
    CaseStudies: "Case Studies",
    IntegrationsLogoCloud: "Tech Stack",
    BrandTrust: "Industries",
    TestimonialsSlider: "Testimonials",
    ContactCta: "Contact",
    CtaBand: "Get Started",
  },
  saas: {
    HeroProduct: "Hero",
    FeaturesModern: "Features",
    PricingModern: "Pricing",
    IntegrationsLogoCloud: "Integrations",
    FaqAccordion: "FAQ",
    CtaSplit: "Get Started",
    ContactCta: "Contact",
  },
  automotive: {
    HeroLuxuryShowcase: "Hero",
    VehicleShowcase: "Models",
    InventoryGrid: "Inventory",
    VehicleComparison: "Features",
    AppointmentCalendar: "Test Drive",
    FinanceCalculator: "Financing",
    TestimonialsSlider: "Testimonials",
    BookingCta: "Contact",
  },
  tourism: {
    HeroFullBleed: "Hero",
    DestinationsGallery: "Destinations",
    TourPackagesGrid: "Tour Packages",
    BookingSection: "Booking",
    TestimonialsCarousel: "Testimonials",
    TravelCtaBand: "Book Your Trip",
    FaqAccordion: "FAQ",
    ContactCta: "Contact",
  },
  restaurant: {
    HeroCinematic: "Hero",
    MenuHighlights: "Menu",
    GalleryExperience: "Gallery",
    FeatureStorytelling: "Chef Story",
    ReservationSection: "Reservations",
    TestimonialsSlider: "Testimonials",
    MapsSection: "Location",
    ContactCta: "Contact",
  },
  "real-estate": {
    HeroProperty: "Hero",
    PropertyListings: "Listings",
    LocationSections: "Locations",
    TeamSection: "Agents",
    ContactSection: "Inquiry",
    TestimonialsModern: "Testimonials",
  },
  medical: {
    HeroSplit: "Hero",
    CareServices: "Services",
    DoctorProfiles: "Doctors",
    BookingForm: "Appointments",
    MapsSection: "Location",
    FaqAccordion: "FAQ",
    ContactCta: "Contact",
  },
  law: {
    HeroLuxury: "Hero",
    ServicesModern: "Practice Areas",
    TeamSection: "Attorneys",
    CaseStudies: "Cases",
    BookingForm: "Consultation",
    MapsSection: "Office",
    CtaSplit: "Legal CTA",
  },
  education: {
    HeroSplit: "Hero",
    ProgramsGrid: "Programs",
    ProductShowcase: "Courses",
    TeamSection: "Teachers",
    AdmissionsCta: "Admissions",
    BlogSection: "News",
    ContactSection: "Contact",
  },
  blog: {
    HeroSplit: "Hero",
    BlogSection: "Articles",
    FeatureHighlights: "Categories",
    TeamSection: "Author",
    CtaSplit: "Newsletter",
  },
  landing: {
    HeroProduct: "Hero",
    FeatureHighlights: "Benefits",
    FeaturesModern: "Features",
    PricingModern: "Pricing",
    CtaBand: "Get Started",
    ContactCta: "Contact",
  },
  generic: {},
};

const PALETTES: Record<VerticalPaletteId, DesignRendererComponentId[]> = {
  technology: PALETTE_TECHNOLOGY,
  saas: PALETTE_SAAS,
  automotive: PALETTE_AUTOMOTIVE,
  tourism: PALETTE_TOURISM,
  restaurant: PALETTE_RESTAURANT,
  "real-estate": PALETTE_REAL_ESTATE,
  medical: PALETTE_MEDICAL,
  law: PALETTE_LAW,
  education: PALETTE_EDUCATION,
  blog: PALETTE_BLOG,
  landing: PALETTE_LANDING,
  generic: PALETTE_TECHNOLOGY,
};

export function normalizeVerticalIndustryId(
  value?: string | null,
): IndustryId | "business" | "multi" {
  const raw = (value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (!raw) return "business";
  if (raw === "multi") return "multi";
  if (
    raw === "saas" ||
    raw === "software" ||
    raw === "subscription"
  ) {
    return "saas";
  }
  if (
    raw === "technology" ||
    raw === "tech" ||
    raw === "computer" ||
    raw === "it" ||
    raw === "hardware"
  ) {
    return "technology";
  }
  if (raw === "furniture" || raw === "furnishing" || raw === "home-furnish") {
    return "furniture";
  }
  if (
    raw === "automotive" ||
    raw === "auto" ||
    raw === "car" ||
    raw === "dealership"
  ) {
    return "automotive";
  }
  if (raw === "restaurant" || raw === "dining" || raw === "food") {
    return "restaurant";
  }
  if (
    raw === "tourism" ||
    raw === "travel" ||
    raw === "tour" ||
    raw === "hospitality" ||
    raw === "vacation"
  ) {
    return "tourism";
  }
  if (
    raw === "real-estate" ||
    raw === "realestate" ||
    raw === "property"
  ) {
    return "real-estate";
  }
  if (
    raw === "clinic" ||
    raw === "medical" ||
    raw === "healthcare" ||
    raw === "hospital" ||
    raw === "dental"
  ) {
    return "clinic";
  }
  if (raw === "law" || raw === "legal" || raw === "attorney") {
    return "law";
  }
  if (raw === "education" || raw === "school" || raw === "university") {
    return "education";
  }
  if (raw === "blog" || raw === "editorial" || raw === "magazine") {
    return "blog";
  }
  if (raw === "landing-page" || raw === "landing" || raw === "landingpage") {
    return "landing-page";
  }
  return raw as IndustryId;
}

export function inferVerticalFromText(text: string): IndustryId | "business" {
  const haystack = text.toLowerCase();
  if (/furniture|sofa|bedroom|living room|أثاث|مفروشات/.test(haystack)) {
    return "furniture";
  }
  if (isTourismContext(haystack)) return "tourism";
  if (isAutomotiveContext(haystack)) return "automotive";
  if (RESTAURANT_SIGNALS.some((s) => haystack.includes(s))) return "restaurant";
  if (/real estate|realtor|property listing|home buyer/.test(haystack)) {
    return "real-estate";
  }
  if (/computer company|computers?|it services|hardware|servers/.test(haystack)) {
    return "technology";
  }
  if (SOFTWARE_SIGNALS.some((s) => haystack.includes(s))) return "saas";
  return "business";
}

export function resolveVerticalPaletteId(
  industryId?: string | null,
  haystack?: string,
): VerticalPaletteId {
  const normalized = normalizeVerticalIndustryId(industryId);
  const text = haystack?.toLowerCase() || "";

  if (normalized === "automotive") return "automotive";
  if (normalized === "tourism") return "tourism";
  if (normalized === "restaurant") return "restaurant";
  if (normalized === "real-estate") return "real-estate";
  if (normalized === "clinic") return "medical";
  if (normalized === "law") return "law";
  if (normalized === "education") return "education";
  if (normalized === "blog") return "blog";
  if (normalized === "landing-page") return "landing";

  if (normalized === "saas" || SOFTWARE_SIGNALS.some((s) => text.includes(s))) {
    if (
      /subscription|pricing|free trial|b2b saas|per seat|plan tiers/.test(text)
    ) {
      return "saas";
    }
    return "technology";
  }

  const inferred = inferVerticalFromText(text);
  if (inferred === "tourism") return "tourism";
  if (inferred === "automotive") return "automotive";
  if (inferred === "restaurant") return "restaurant";
  if (inferred === "real-estate") return "real-estate";
  if (inferred === "saas") {
    return /subscription|pricing|free trial/.test(text) ? "saas" : "technology";
  }

  return "generic";
}

export function getIndustryComponentPalette(
  paletteId: VerticalPaletteId,
): DesignRendererComponentId[] {
  return [...PALETTES[paletteId]];
}

export function getSectionLabelForIndustry(
  componentId: string,
  paletteId?: VerticalPaletteId,
  language?: string | null,
): string | undefined {
  if (usesLlmLocalizedWebsiteCopy(language)) return undefined;
  if (!paletteId) return undefined;
  return SECTION_LABELS[paletteId]?.[componentId as DesignRendererComponentId];
}

function isChromeComponent(id: string): boolean {
  return /Header|Nav|Footer/i.test(id);
}

function isHeroComponent(id: string): boolean {
  return /Hero/i.test(id);
}

function pickHeroForPalette(
  paletteId: VerticalPaletteId,
  template: TemplateIntelligenceDefinition,
): DesignRendererComponentId {
  const paletteHero = PALETTES[paletteId].find((c) => isHeroComponent(c));
  const templateHero = template.components.find((c) => isHeroComponent(c));
  if (paletteId === "automotive" || paletteId === "restaurant" || paletteId === "tourism") {
    return paletteHero || (templateHero as DesignRendererComponentId) || "HeroSplit";
  }
  return (
    paletteHero ||
    (templateHero as DesignRendererComponentId) ||
    "HeroInteractive"
  );
}

export function hasCrossIndustryComponents(
  components: DesignRendererComponentId[],
  paletteId: VerticalPaletteId,
): boolean {
  if (paletteId === "automotive") return false;
  if (paletteId === "restaurant") {
    return components.some((c) => AUTOMOTIVE_ONLY_COMPONENTS.includes(c));
  }
  return components.some(
    (c) =>
      AUTOMOTIVE_ONLY_COMPONENTS.includes(c) ||
      RESTAURANT_ONLY_COMPONENTS.includes(c),
  );
}

/**
 * Merge template visual chrome with industry-correct body sections.
 * Keeps template colors/typography while preventing wrong vertical components.
 */
export function resolveComponentsForIndustryAndTemplate(
  template: TemplateIntelligenceDefinition,
  industryId?: string | null,
  haystack?: string,
): DesignRendererComponentId[] {
  const templateDna = resolveTemplateDNA(template);
  if (templateDna.components.length) {
    return [...templateDna.components];
  }

  const paletteId = resolveVerticalPaletteId(
    industryId || template.industry,
    haystack,
  );
  const industryPalette = getIndustryComponentPalette(paletteId);

  const templateIndustry = normalizeVerticalIndustryId(template.industry);
  const businessIndustry = normalizeVerticalIndustryId(industryId);
  const industriesAlign =
    template.industry === "multi" ||
    template.industry === "business" ||
    templateIndustry === businessIndustry;

  if (
    industriesAlign &&
    !hasCrossIndustryComponents(template.components, paletteId)
  ) {
    return [...template.components];
  }

  const header =
    template.components.find((c) => /Header|Nav/i.test(c)) ||
    industryPalette.find((c) => /Header|Nav/i.test(c)) ||
    "NavModern";
  const footer =
    template.components.find((c) => /Footer/i.test(c)) ||
    industryPalette.find((c) => /Footer/i.test(c)) ||
    "SiteFooter";
  const hero = pickHeroForPalette(paletteId, template);
  const body = industryPalette.filter(
    (c) => !isChromeComponent(c) && !isHeroComponent(c),
  );

  const merged: DesignRendererComponentId[] = [];
  for (const id of [header, hero, ...body, footer]) {
    if (!merged.includes(id)) merged.push(id);
  }
  return merged;
}

export function sanitizeCtaForIndustry(
  cta: string,
  industryId?: string | null,
): string {
  const normalized = normalizeVerticalIndustryId(industryId);
  const lower = cta.toLowerCase().trim();
  if (!lower) {
    return DEFAULT_PRIMARY_CTA[String(normalized)] || DEFAULT_PRIMARY_CTA.business;
  }

  for (const [vertical, phrases] of Object.entries(INDUSTRY_EXCLUSIVE_CTAS)) {
    if (vertical === normalized) continue;
    if (phrases.some((p) => lower.includes(p))) {
      return (
        DEFAULT_PRIMARY_CTA[String(normalized)] || DEFAULT_PRIMARY_CTA.business
      );
    }
  }
  return cta;
}

export function getDefaultPrimaryCta(industryId?: string | null): string {
  const paletteId = resolveVerticalPaletteId(industryId);
  if (paletteId === "technology" || paletteId === "saas") {
    return DEFAULT_PRIMARY_CTA.saas;
  }
  return DEFAULT_PRIMARY_CTA[paletteId] || DEFAULT_PRIMARY_CTA.business;
}

export function scoreIndustryTemplateAlignment(
  template: TemplateIntelligenceDefinition,
  industryId?: string | null,
  haystack?: string,
): number {
  const text = haystack?.toLowerCase() || "";
  const paletteId = resolveVerticalPaletteId(industryId, text);
  let score = 0;

  const templateIndustry = normalizeVerticalIndustryId(template.industry);
  const businessIndustry = normalizeVerticalIndustryId(industryId);

  if (
    template.industry === "multi" ||
    template.industry === "business" ||
    templateIndustry === businessIndustry
  ) {
    score += 20;
  } else {
    score -= 35;
  }

  const verticalToIndustry: Record<VerticalPaletteId, string> = {
    technology: "saas",
    saas: "saas",
    automotive: "automotive",
    tourism: "tourism",
    restaurant: "restaurant",
    "real-estate": "real-estate",
    medical: "clinic",
    law: "law",
    education: "education",
    blog: "blog",
    landing: "landing-page",
    generic: "business",
  };
  if (templateIndustry === verticalToIndustry[paletteId]) score += 25;

  const hasSoftware = SOFTWARE_SIGNALS.some((s) => text.includes(s));
  const hasAutomotive = AUTOMOTIVE_SIGNALS.some((s) => text.includes(s));

  if (template.industry === "automotive" && hasSoftware && !hasAutomotive) {
    score -= 70;
  }
  if (
    (template.category === "Technology" || template.category === "SaaS") &&
    hasSoftware
  ) {
    score += 30;
  }
  if (template.industry === "automotive" && hasAutomotive) score += 35;
  if (template.industry === "restaurant" && RESTAURANT_SIGNALS.some((s) => text.includes(s))) {
    score += 35;
  }

  return score;
}
