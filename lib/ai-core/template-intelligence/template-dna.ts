/**
 * Template DNA — layout, hero, navigation, sections, and component profiles
 * that make each Template Intelligence entry a true template (not a color variant).
 */

import type { LayoutVariationId } from "@/lib/ai-core/design-intelligence/layout-selection";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type {
  TemplateCardVariant,
  TemplateFooterVariant,
  TemplateHeroVariant,
  TemplateIntelligenceDefinition,
  TemplateNavigationVariant,
  TemplateVisualPreset,
} from "@/lib/ai-core/template-intelligence/types";
import { buildSectionSpecsFromComponents } from "@/lib/ai-core/template-intelligence/section-specs";

export type TemplateDNAProfile = {
  id: string;
  layoutProfile: LayoutVariationId | string;
  heroProfile: string;
  navigationProfile: string;
  footerProfile: string;
  sectionOrder: string[];
  sectionTypes: string[];
  cardProfile: string;
  gridSystem: string;
  galleryProfile: string;
  ctaProfile: string;
  animationProfile: string;
  spacing: "airy" | "balanced" | "compact";
  visualDensity: "minimal" | "balanced" | "rich";
  componentProfile: string;
  components: DesignRendererComponentId[];
};

function comps(
  ...ids: DesignRendererComponentId[]
): DesignRendererComponentId[] {
  return ids;
}

const AUTOMOTIVE_LUXURY: TemplateDNAProfile = {
  id: "automotive-luxury",
  layoutProfile: "cinematic-hero",
  heroProfile: "luxury-vehicle-stage",
  navigationProfile: "transparent-overlay",
  footerProfile: "editorial",
  sectionOrder: [
    "Fullscreen hero",
    "Model gallery",
    "Heritage story",
    "Luxury craftsmanship",
    "Owner testimonials",
    "Concierge CTA",
  ],
  sectionTypes: ["hero", "gallery", "story", "features", "testimonials", "cta"],
  cardProfile: "borderless-editorial",
  gridSystem: "editorial-asymmetric",
  galleryProfile: "full-bleed-mosaic",
  ctaProfile: "ghost-premium",
  animationProfile: "cinematic slow-reveal with parallax-lite",
  spacing: "airy",
  visualDensity: "minimal",
  componentProfile: "Large image cards · museum spacing",
  components: comps(
    "SiteHeaderTransparent",
    "HeroLuxuryShowcase",
    "GalleryExperience",
    "VehicleShowcase",
    "FeatureStorytelling",
    "TestimonialsSlider",
    "BookingCta",
    "SiteFooter",
  ),
};

const AUTOMOTIVE_CORPORATE: TemplateDNAProfile = {
  id: "automotive-corporate",
  layoutProfile: "split-hero",
  heroProfile: "split-hero",
  navigationProfile: "corporate-topbar",
  footerProfile: "multi-column",
  sectionOrder: [
    "Split hero",
    "Services",
    "Vehicle comparison",
    "Financing options",
    "Dealer network",
    "Process steps",
    "Contact",
  ],
  sectionTypes: [
    "hero",
    "services",
    "comparison",
    "finance",
    "trust",
    "process",
    "contact",
  ],
  cardProfile: "elevated-trust",
  gridSystem: "trust-then-offer",
  galleryProfile: "structured-grid",
  ctaProfile: "solid-corporate",
  animationProfile: "subtle fade-up entrances",
  spacing: "balanced",
  visualDensity: "balanced",
  componentProfile: "Information cards · professional hierarchy",
  components: comps(
    "SiteHeader",
    "HeroSplit",
    "ServicesModern",
    "VehicleComparison",
    "FinanceCalculator",
    "BrandTrust",
    "ProcessSteps",
    "ContactSection",
    "SiteFooter",
  ),
};

const AUTOMOTIVE_MODERN: TemplateDNAProfile = {
  id: "automotive-modern",
  layoutProfile: "interactive-hero",
  heroProfile: "product-showcase-hero",
  navigationProfile: "pill-modern",
  footerProfile: "multi-column",
  sectionOrder: [
    "Center hero",
    "Inventory grid",
    "Product comparison",
    "Dynamic features",
    "Reviews",
    "Test drive CTA",
  ],
  sectionTypes: [
    "hero",
    "inventory",
    "comparison",
    "features",
    "testimonials",
    "booking",
  ],
  cardProfile: "elevated-soft",
  gridSystem: "commerce-grid",
  galleryProfile: "dynamic-cards",
  ctaProfile: "filled-modern",
  animationProfile: "interactive stagger + glow-in",
  spacing: "balanced",
  visualDensity: "rich",
  componentProfile: "Modern cards · dynamic grids",
  components: comps(
    "NavModern",
    "HeroProduct",
    "InventoryGrid",
    "VehicleComparison",
    "FeaturesModern",
    "TestimonialsModern",
    "AppointmentCalendar",
    "CtaBand",
    "SiteFooter",
  ),
};

const AUTOMOTIVE_TECHNOLOGY: TemplateDNAProfile = {
  id: "automotive-technology",
  layoutProfile: "dashboard",
  heroProfile: "interactive-hero",
  navigationProfile: "sticky-product-cta",
  footerProfile: "minimal",
  sectionOrder: [
    "Futuristic hero",
    "AI feature blocks",
    "Technology timeline",
    "Interactive dashboard",
    "Integrations",
    "Demo CTA",
  ],
  sectionTypes: [
    "hero",
    "features",
    "timeline",
    "product",
    "integrations",
    "cta",
  ],
  cardProfile: "glass",
  gridSystem: "interactive-product-story",
  galleryProfile: "glass-panels",
  ctaProfile: "glow-tech",
  animationProfile: "interactive stagger + glow-in",
  spacing: "compact",
  visualDensity: "rich",
  componentProfile: "Glass cards · dashboard panels",
  components: comps(
    "NavModern",
    "HeroInteractive",
    "FeaturesBento",
    "TimelineSection",
    "ProductInteractive",
    "IntegrationsLogoCloud",
    "CaseStudies",
    "CtaBand",
    "SiteFooter",
  ),
};

const DNA_BY_TEMPLATE_ID: Record<string, TemplateDNAProfile> = {
  "ti-automotive-showroom": AUTOMOTIVE_LUXURY,
  "ti-automotive-luxury": AUTOMOTIVE_LUXURY,
  "ti-automotive-corporate": AUTOMOTIVE_CORPORATE,
  "ti-automotive-modern": AUTOMOTIVE_MODERN,
  "ti-automotive-technology": AUTOMOTIVE_TECHNOLOGY,
  "ti-luxury-noir": {
    id: "luxury-noir",
    layoutProfile: "cinematic-hero",
    heroProfile: "editorial-flagship",
    navigationProfile: "transparent-overlay",
    footerProfile: "editorial",
    sectionOrder: [
      "Editorial hero",
      "Feature storytelling",
      "Gallery experience",
      "Social proof",
      "Premium CTA",
      "Contact",
    ],
    sectionTypes: ["hero", "story", "gallery", "testimonials", "cta", "contact"],
    cardProfile: "borderless-editorial",
    gridSystem: "premium-storytelling",
    galleryProfile: "full-bleed-mosaic",
    ctaProfile: "ghost-premium",
    animationProfile: "cinematic slow-reveal",
    spacing: "airy",
    visualDensity: "minimal",
    componentProfile: "Large image cards",
    components: comps(
      "SiteHeaderTransparent",
      "HeroLuxury",
      "FeatureStorytelling",
      "GalleryExperience",
      "TestimonialsSlider",
      "CtaSplit",
      "SiteFooterEditorial",
    ),
  },
  "ti-corporate-trust": {
    id: "corporate-trust",
    layoutProfile: "split-hero",
    heroProfile: "split-hero",
    navigationProfile: "corporate-topbar",
    footerProfile: "multi-column",
    sectionOrder: [
      "Trust hero",
      "Services",
      "Process",
      "Brand trust",
      "Testimonials",
      "Contact",
    ],
    sectionTypes: ["hero", "services", "process", "trust", "testimonials", "contact"],
    cardProfile: "structured",
    gridSystem: "trust-then-offer",
    galleryProfile: "structured-grid",
    ctaProfile: "solid-corporate",
    animationProfile: "subtle fade-up entrances",
    spacing: "balanced",
    visualDensity: "balanced",
    componentProfile: "Information cards",
    components: comps(
      "SiteHeader",
      "HeroSplit",
      "ServicesModern",
      "ProcessSteps",
      "BrandTrust",
      "TestimonialsModern",
      "ContactSection",
      "SiteFooter",
    ),
  },
  "ti-modern-clean": {
    id: "modern-clean",
    layoutProfile: "interactive-hero",
    heroProfile: "product-showcase-hero",
    navigationProfile: "pill-modern",
    footerProfile: "multi-column",
    sectionOrder: [
      "Product hero",
      "Features",
      "Services",
      "Pricing",
      "FAQ",
      "CTA",
    ],
    sectionTypes: ["hero", "features", "services", "pricing", "faq", "cta"],
    cardProfile: "soft-shadow",
    gridSystem: "commerce-grid",
    galleryProfile: "card-grid",
    ctaProfile: "filled-modern",
    animationProfile: "stagger cards 70ms",
    spacing: "balanced",
    visualDensity: "rich",
    componentProfile: "Modern cards",
    components: comps(
      "NavModern",
      "HeroSplit",
      "FeaturesModern",
      "ServicesModern",
      "PricingModern",
      "FaqAccordion",
      "CtaSplit",
      "SiteFooter",
    ),
  },
  "ti-technology-dark": {
    id: "technology-dark",
    layoutProfile: "interactive-hero",
    heroProfile: "interactive-hero",
    navigationProfile: "sticky-product-cta",
    footerProfile: "minimal",
    sectionOrder: [
      "Interactive hero",
      "Bento features",
      "Case studies",
      "Integrations",
      "Trust strip",
      "Demo CTA",
    ],
    sectionTypes: ["hero", "features", "case-studies", "integrations", "trust", "cta"],
    cardProfile: "glass",
    gridSystem: "interactive-product-story",
    galleryProfile: "glass-panels",
    ctaProfile: "glow-tech",
    animationProfile: "interactive stagger + glow-in",
    spacing: "compact",
    visualDensity: "rich",
    componentProfile: "Glass cards · bento grids",
    components: comps(
      "NavSidebar",
      "HeroInteractive",
      "FeaturesBento",
      "CaseStudies",
      "IntegrationsLogoCloud",
      "BrandTrust",
      "CtaBand",
      "SiteFooterMinimal",
    ),
  },
  "ti-creative-studio": {
    id: "creative-studio",
    layoutProfile: "editorial",
    heroProfile: "cinematic-hero",
    navigationProfile: "studio-transparent",
    footerProfile: "minimal",
    sectionOrder: [
      "Cinematic hero",
      "Portfolio gallery",
      "Case studies",
      "Story",
      "CTA",
      "Contact",
    ],
    sectionTypes: ["hero", "gallery", "case-studies", "story", "cta", "contact"],
    cardProfile: "bold-media",
    gridSystem: "portfolio-mosaic",
    galleryProfile: "asymmetric-mosaic",
    ctaProfile: "bold-creative",
    animationProfile: "asymmetric staggered reveals",
    spacing: "airy",
    visualDensity: "minimal",
    componentProfile: "Asymmetrical cards",
    components: comps(
      "SiteHeaderTransparent",
      "HeroCinematic",
      "GalleryExperience",
      "CaseStudies",
      "FeatureStorytelling",
      "CtaSplit",
      "SiteFooterMinimal",
    ),
  },
  "ti-minimal-white": {
    id: "minimal-white",
    layoutProfile: "image-focused-hero",
    heroProfile: "minimal-bleed",
    navigationProfile: "centered-logo",
    footerProfile: "minimal",
    sectionOrder: [
      "Minimal hero",
      "Highlights",
      "Services grid",
      "Testimonials",
      "Contact",
    ],
    sectionTypes: ["hero", "features", "services", "testimonials", "contact"],
    cardProfile: "borderless",
    gridSystem: "card-first-masonry",
    galleryProfile: "minimal-grid",
    ctaProfile: "outline-minimal",
    animationProfile: "soft fade-up",
    spacing: "airy",
    visualDensity: "minimal",
    componentProfile: "Borderless editorial cards · card-first layout",
    components: comps(
      "NavCentered",
      "HeroFullBleed",
      "FeatureHighlights",
      "ServicesGrid",
      "TestimonialsCarousel",
      "ContactCta",
      "SiteFooterMinimal",
    ),
  },
  "ti-red-premium": {
    id: "red-premium-editorial",
    layoutProfile: "editorial",
    heroProfile: "cinematic-fullscreen",
    navigationProfile: "hamburger-offcanvas",
    footerProfile: "editorial",
    sectionOrder: [
      "Fullscreen hero",
      "Magazine features",
      "Storytelling",
      "Timeline",
      "Gallery",
      "Editorial footer",
    ],
    sectionTypes: ["hero", "magazine", "story", "timeline", "gallery", "footer"],
    cardProfile: "bold-editorial",
    gridSystem: "magazine-columns",
    galleryProfile: "asymmetric-mosaic",
    ctaProfile: "editorial-outline",
    animationProfile: "editorial scroll reveals · large typography",
    spacing: "airy",
    visualDensity: "minimal",
    componentProfile: "Magazine sections · oversized headlines",
    components: comps(
      "NavHamburger",
      "HeroCinematic",
      "BlogSection",
      "FeatureStorytelling",
      "TimelineSection",
      "GalleryExperience",
      "SiteFooterEditorial",
    ),
  },
  "ti-saas-growth": {
    id: "saas-growth-bold",
    layoutProfile: "card-first",
    heroProfile: "product-showcase-hero",
    navigationProfile: "centered-logo",
    footerProfile: "minimal",
    sectionOrder: [
      "Product hero",
      "Masonry portfolio",
      "Features",
      "Pricing layers",
      "Integrations",
      "FAQ",
      "Floating CTA",
    ],
    sectionTypes: ["hero", "gallery", "features", "pricing", "integrations", "faq", "cta"],
    cardProfile: "elevated-soft",
    gridSystem: "card-first-masonry",
    galleryProfile: "masonry-portfolio",
    ctaProfile: "floating-conversion",
    animationProfile: "scale-in cards · conversion micro-motion",
    spacing: "balanced",
    visualDensity: "rich",
    componentProfile: "Card-first homepage · masonry gallery",
    components: comps(
      "NavCentered",
      "HeroProduct",
      "PortfolioGallery",
      "FeaturesModern",
      "PricingModern",
      "IntegrationsLogoCloud",
      "FaqAccordion",
      "SiteFooterMinimal",
    ),
  },
  "ti-cafe-artisan": {
    id: "cafe-artisan",
    layoutProfile: "editorial-hero",
    heroProfile: "morning-split-hero",
    navigationProfile: "pill-modern",
    footerProfile: "warm-minimal",
    sectionOrder: ["Morning hero", "Roast story", "Menu cards", "Community gallery", "Reservations"],
    sectionTypes: ["hero", "story", "menu", "gallery", "booking"],
    cardProfile: "warm-rounded",
    gridSystem: "cafe-menu-grid",
    galleryProfile: "lifestyle-mosaic",
    ctaProfile: "soft-filled",
    animationProfile: "warm reveal · gentle stagger",
    spacing: "airy",
    visualDensity: "balanced",
    componentProfile: "Artisan menu cards · morning light",
    components: comps(
      "NavModern",
      "HeroSplit",
      "FeatureStorytelling",
      "MenuHighlights",
      "GalleryGrid",
      "ReservationSection",
      "ContactCta",
      "SiteFooter",
    ),
  },
  "ti-architecture-monograph": {
    id: "architecture-monograph",
    layoutProfile: "editorial-hero",
    heroProfile: "monograph-cinematic",
    navigationProfile: "transparent-overlay",
    footerProfile: "editorial",
    sectionOrder: ["Project hero", "Case studies", "Process essay", "Studio team", "Inquiry"],
    sectionTypes: ["hero", "portfolio", "process", "team", "contact"],
    cardProfile: "borderless-editorial",
    gridSystem: "magazine-columns",
    galleryProfile: "asymmetric-mosaic",
    ctaProfile: "editorial-outline",
    animationProfile: "editorial flow · parallax columns",
    spacing: "airy",
    visualDensity: "minimal",
    componentProfile: "Monograph folio · architectural grid",
    components: comps(
      "SiteHeaderTransparent",
      "HeroCinematic",
      "CaseStudies",
      "GalleryExperience",
      "ProcessSteps",
      "ContactSection",
      "SiteFooterEditorial",
    ),
  },
  "ti-construction-industrial": {
    id: "construction-industrial",
    layoutProfile: "split-hero",
    heroProfile: "industrial-split",
    navigationProfile: "corporate-topbar",
    footerProfile: "multi-column",
    sectionOrder: ["Capability hero", "Services", "Project timeline", "Safety trust", "Bid CTA"],
    sectionTypes: ["hero", "services", "timeline", "trust", "cta"],
    cardProfile: "structured-industrial",
    gridSystem: "capability-matrix",
    galleryProfile: "project-grid",
    ctaProfile: "solid-corporate",
    animationProfile: "industrial snap · grid stagger",
    spacing: "balanced",
    visualDensity: "balanced",
    componentProfile: "Heavy-duty cards · safety badges",
    components: comps(
      "SiteHeader",
      "HeroSplit",
      "ServicesModern",
      "TimelineSection",
      "BrandTrust",
      "ContactSection",
      "SiteFooter",
    ),
  },
  "ti-dental-smile": {
    id: "dental-smile",
    layoutProfile: "split-hero",
    heroProfile: "clinical-fullbleed",
    navigationProfile: "corporate-topbar",
    footerProfile: "multi-column",
    sectionOrder: ["Smile hero", "Treatments", "Doctors", "Patient stories", "Book visit"],
    sectionTypes: ["hero", "services", "team", "testimonials", "booking"],
    cardProfile: "clinical-soft",
    gridSystem: "care-services-grid",
    galleryProfile: "before-after-grid",
    ctaProfile: "filled-trust",
    animationProfile: "soft fade-up",
    spacing: "airy",
    visualDensity: "minimal",
    componentProfile: "Clinical calm · treatment cards",
    components: comps(
      "SiteHeader",
      "HeroFullBleed",
      "CareServices",
      "DoctorProfiles",
      "BookingForm",
      "ContactCta",
      "SiteFooter",
    ),
  },
  "ti-pharmacy-wellness": {
    id: "pharmacy-wellness",
    layoutProfile: "product-saas",
    heroProfile: "wellness-split",
    navigationProfile: "corporate-topbar",
    footerProfile: "multi-column",
    sectionOrder: ["Wellness hero", "Service lanes", "Pharmacist trust", "Refill CTA"],
    sectionTypes: ["hero", "services", "trust", "cta"],
    cardProfile: "wellness-soft",
    gridSystem: "service-lanes",
    galleryProfile: "product-shelf",
    ctaProfile: "filled-modern",
    animationProfile: "warm reveal",
    spacing: "balanced",
    visualDensity: "balanced",
    componentProfile: "Wellness lanes · accessible cards",
    components: comps(
      "SiteHeader",
      "HeroSplit",
      "CareServices",
      "BrandTrust",
      "BookingForm",
      "ContactCta",
      "SiteFooter",
    ),
  },
  "ti-insurance-shield": {
    id: "insurance-shield",
    layoutProfile: "split-hero",
    heroProfile: "assurance-split",
    navigationProfile: "corporate-topbar",
    footerProfile: "multi-column",
    sectionOrder: ["Coverage hero", "Plans", "Advisors", "Claims FAQ", "Quote"],
    sectionTypes: ["hero", "pricing", "team", "faq", "cta"],
    cardProfile: "elevated-trust",
    gridSystem: "plan-comparison",
    galleryProfile: "structured-grid",
    ctaProfile: "solid-corporate",
    animationProfile: "subtle fade-up",
    spacing: "balanced",
    visualDensity: "balanced",
    componentProfile: "Plan cards · trust hierarchy",
    components: comps(
      "SiteHeader",
      "HeroSplit",
      "PricingModern",
      "TeamSection",
      "FaqAccordion",
      "ContactSection",
      "SiteFooter",
    ),
  },
  "ti-university-heritage": {
    id: "university-heritage",
    layoutProfile: "campus-education",
    heroProfile: "campus-cinematic",
    navigationProfile: "transparent-overlay",
    footerProfile: "multi-column",
    sectionOrder: ["Campus hero", "Schools", "Research", "Campus life", "Apply"],
    sectionTypes: ["hero", "programs", "research", "gallery", "admissions"],
    cardProfile: "heritage-elevated",
    gridSystem: "campus-grid",
    galleryProfile: "campus-mosaic",
    ctaProfile: "solid-corporate",
    animationProfile: "cinematic slow-reveal",
    spacing: "airy",
    visualDensity: "rich",
    componentProfile: "Heritage serif · campus storytelling",
    components: comps(
      "SiteHeaderTransparent",
      "HeroCinematic",
      "ProgramsGrid",
      "GalleryExperience",
      "AdmissionsCta",
      "ContactSection",
      "SiteFooter",
    ),
  },
  "ti-beauty-glow": {
    id: "beauty-glow",
    layoutProfile: "cinematic-hero",
    heroProfile: "luminous-editorial",
    navigationProfile: "transparent-overlay",
    footerProfile: "editorial",
    sectionOrder: ["Luminous hero", "Rituals", "Products", "Testimonials", "Book"],
    sectionTypes: ["hero", "services", "products", "testimonials", "booking"],
    cardProfile: "borderless-editorial",
    gridSystem: "spa-editorial",
    galleryProfile: "full-bleed-mosaic",
    ctaProfile: "ghost-premium",
    animationProfile: "cinematic glow · soft parallax",
    spacing: "airy",
    visualDensity: "minimal",
    componentProfile: "Spa editorial · luminous cards",
    components: comps(
      "SiteHeaderTransparent",
      "HeroLuxury",
      "FeatureStorytelling",
      "ProductShowcase",
      "BookingForm",
      "SiteFooterEditorial",
    ),
  },
  "ti-fitness-pulse": {
    id: "fitness-pulse",
    layoutProfile: "interactive-hero",
    heroProfile: "athletic-interactive",
    navigationProfile: "sticky-product-cta",
    footerProfile: "minimal",
    sectionOrder: ["Power hero", "Programs", "Trainers", "Pricing", "Join"],
    sectionTypes: ["hero", "programs", "team", "pricing", "cta"],
    cardProfile: "bold-energy",
    gridSystem: "momentum-grid",
    galleryProfile: "dynamic-cards",
    ctaProfile: "glow-tech",
    animationProfile: "energetic pulse · scale-in",
    spacing: "compact",
    visualDensity: "rich",
    componentProfile: "Bold energy cards · dark athletic",
    components: comps(
      "NavModern",
      "HeroInteractive",
      "FeaturesBento",
      "TeamSection",
      "PricingModern",
      "CtaBand",
      "SiteFooter",
    ),
  },
  "ti-logistics-freight": {
    id: "logistics-freight",
    layoutProfile: "split-hero",
    heroProfile: "freight-split",
    navigationProfile: "corporate-topbar",
    footerProfile: "multi-column",
    sectionOrder: ["Route hero", "Fleet", "Tracking", "Partners", "Quote"],
    sectionTypes: ["hero", "services", "trust", "integrations", "contact"],
    cardProfile: "structured-industrial",
    gridSystem: "operations-grid",
    galleryProfile: "route-map",
    ctaProfile: "solid-corporate",
    animationProfile: "industrial snap",
    spacing: "balanced",
    visualDensity: "balanced",
    componentProfile: "Operations cards · fleet metrics",
    components: comps(
      "SiteHeader",
      "HeroSplit",
      "TimelineSection",
      "BrandTrust",
      "ContactSection",
      "SiteFooter",
    ),
  },
  "ti-manufacturing-precision": {
    id: "manufacturing-precision",
    layoutProfile: "product-saas",
    heroProfile: "precision-product",
    navigationProfile: "corporate-topbar",
    footerProfile: "multi-column",
    sectionOrder: ["Engineering hero", "Capabilities", "Quality", "Certifications", "RFQ"],
    sectionTypes: ["hero", "features", "trust", "integrations", "contact"],
    cardProfile: "precision-structured",
    gridSystem: "capability-matrix",
    galleryProfile: "technical-grid",
    ctaProfile: "solid-corporate",
    animationProfile: "crisp stagger",
    spacing: "balanced",
    visualDensity: "balanced",
    componentProfile: "Engineering precision · spec cards",
    components: comps(
      "SiteHeader",
      "HeroProduct",
      "FeaturesModern",
      "ProcessSteps",
      "BrandTrust",
      "ContactSection",
      "SiteFooter",
    ),
  },
  "ti-nonprofit-impact": {
    id: "nonprofit-impact",
    layoutProfile: "editorial-hero",
    heroProfile: "mission-fullbleed",
    navigationProfile: "corporate-topbar",
    footerProfile: "multi-column",
    sectionOrder: ["Mission hero", "Impact metrics", "Programs", "Volunteer", "Donate"],
    sectionTypes: ["hero", "impact", "programs", "cta", "donate"],
    cardProfile: "warm-humanitarian",
    gridSystem: "impact-story",
    galleryProfile: "community-grid",
    ctaProfile: "filled-warm",
    animationProfile: "warm reveal · human stories",
    spacing: "airy",
    visualDensity: "balanced",
    componentProfile: "Humanitarian warmth · impact cards",
    components: comps(
      "SiteHeader",
      "HeroFullBleed",
      "FeatureStorytelling",
      "TimelineSection",
      "CtaBand",
      "ContactCta",
      "SiteFooter",
    ),
  },
};

function categoryDefaults(
  template: TemplateIntelligenceDefinition,
): Partial<TemplateDNAProfile> {
  const sectionSpecs = buildSectionSpecsFromComponents(template.components);
  const hero = template.components.find((c) => /Hero/i.test(c));
  const header = template.components.find((c) => /Header|Nav/i.test(c));
  const footer = template.components.find((c) => /Footer/i.test(c));
  return {
    layoutProfile: template.layoutStructure,
    heroProfile: hero ? String(hero) : "split-hero",
    navigationProfile: header?.includes("Transparent")
      ? "transparent-overlay"
      : header?.includes("NavModern")
        ? "pill-modern"
        : "corporate-topbar",
    footerProfile: footer ? "multi-column" : "multi-column",
    sectionOrder: sectionSpecs
      .filter((s) => s.role === "section" || s.role === "hero")
      .map((s) => s.label),
    sectionTypes: sectionSpecs.map((s) => s.role),
    cardProfile:
      template.category === "Luxury"
        ? "borderless-editorial"
        : template.category === "Technology"
          ? "glass"
          : "soft-shadow",
    gridSystem:
      template.layoutStructure === "product-saas"
        ? "commerce-grid"
        : template.layoutStructure === "editorial-hero"
          ? "editorial-asymmetric"
          : "symmetric-grid",
    galleryProfile:
      template.layoutStructure === "studio-portfolio"
        ? "asymmetric-mosaic"
        : "card-grid",
    ctaProfile: template.category === "Luxury" ? "ghost-premium" : "filled-modern",
    animationProfile: template.animations.label,
    spacing:
      template.designPreset === "luxury" || template.designPreset === "minimal"
        ? "airy"
        : "balanced",
    visualDensity:
      template.category === "Technology" || template.category === "SaaS"
        ? "rich"
        : "balanced",
    componentProfile: `${template.designStyle} · ${template.category}`,
    components: [...template.components],
  };
}

/** Resolve Template DNA for a catalog entry (explicit registry + category fallback). */
export function resolveTemplateDNA(
  template: TemplateIntelligenceDefinition,
): TemplateDNAProfile {
  const explicit = DNA_BY_TEMPLATE_ID[template.id];
  if (explicit) return explicit;

  const defaults = categoryDefaults(template);
  return {
    id: template.id,
    layoutProfile: (defaults.layoutProfile ||
      "split-hero") as LayoutVariationId,
    heroProfile: defaults.heroProfile || "split-hero",
    navigationProfile: defaults.navigationProfile || "corporate-topbar",
    footerProfile: defaults.footerProfile || "multi-column",
    sectionOrder:
      defaults.sectionOrder?.length
        ? defaults.sectionOrder
        : ["Hero", "Services", "Social proof", "CTA", "Contact"],
    sectionTypes: defaults.sectionTypes || ["hero", "section", "cta"],
    cardProfile: defaults.cardProfile || "soft-shadow",
    gridSystem: defaults.gridSystem || "symmetric-grid",
    galleryProfile: defaults.galleryProfile || "card-grid",
    ctaProfile: defaults.ctaProfile || "filled-modern",
    animationProfile:
      defaults.animationProfile || template.animations.label,
    spacing: defaults.spacing || "balanced",
    visualDensity: defaults.visualDensity || "balanced",
    componentProfile:
      defaults.componentProfile || `${template.category} components`,
    components: defaults.components?.length
      ? defaults.components
      : [...template.components],
  };
}

export function applyTemplateDnaToIntelligence<
  T extends {
    sectionStructure?: string[];
    heroTreatment?: string;
    sectionLayout?: string;
    cardStyle?: string;
    navigationStyle?: string;
    animationDirection?: string;
    layoutVariationId?: string;
    layoutStyle?: string;
    reason?: string;
  },
>(intelligence: T, dna: TemplateDNAProfile): T {
  return {
    ...intelligence,
    sectionStructure: dna.sectionOrder,
    heroTreatment: dna.heroProfile,
    sectionLayout: dna.gridSystem,
    cardStyle: dna.cardProfile,
    navigationStyle: dna.navigationProfile,
    animationDirection: dna.animationProfile,
    layoutVariationId: dna.layoutProfile,
    layoutStyle: String(dna.layoutProfile),
    reason: `Template DNA "${dna.id}" drives layout, sections, and components (not industry-only defaults)`,
  };
}

function mapHeroVariant(profile: string): TemplateHeroVariant {
  if (/luxury|vehicle|showroom|editorial-flagship/.test(profile)) {
    return "luxury-editorial";
  }
  if (/cinematic|fullscreen|full-bleed/.test(profile)) return "cinematic-full";
  if (/interactive|futuristic|dashboard/.test(profile)) return "saas-split";
  if (/minimal/.test(profile)) return "minimal-bleed";
  if (/split|corporate|trust/.test(profile)) return "corporate-trust";
  if (/product|showcase/.test(profile)) return "saas-split";
  return "corporate-trust";
}

function mapNavVariant(profile: string): TemplateNavigationVariant {
  if (/hamburger|offcanvas/.test(profile)) return "plain-minimal";
  if (/sidebar|rail/.test(profile)) return "pill-modern";
  if (/centered/.test(profile)) return "plain-minimal";
  if (/transparent|overlay|minimal/.test(profile)) return "transparent-underline";
  if (/corporate|topbar|solid/.test(profile)) return "solid-corporate";
  if (/pill|modern/.test(profile)) return "pill-modern";
  if (/sticky|product/.test(profile)) return "pill-modern";
  return "plain-minimal";
}

function mapCardVariant(profile: string): TemplateCardVariant {
  if (/glass/.test(profile)) return "glass";
  if (/borderless|editorial/.test(profile)) return "borderless";
  if (/soft|elevated/.test(profile)) return "soft-shadow";
  if (/structured|trust|information/.test(profile)) return "structured";
  if (/bold|media/.test(profile)) return "premium-red";
  return "structured";
}

function mapSectionLayout(grid: string): TemplateVisualPreset["layout"]["sectionLayout"] {
  if (/card-first|masonry/.test(grid)) return "asymmetric";
  if (/magazine/.test(grid)) return "editorial";
  if (/bento|interactive-product/.test(grid)) return "bento";
  if (/editorial|asymmetric|mosaic|story/.test(grid)) return "editorial";
  if (/asymmetric|portfolio/.test(grid)) return "asymmetric";
  if (/commerce|grid|symmetric/.test(grid)) return "grid";
  return "grid";
}

function mapFooterVariant(profile: string): TemplateFooterVariant {
  if (/editorial|minimal/.test(profile)) return "editorial";
  if (/minimal/.test(profile)) return "minimal";
  return "multi-column";
}

/** Merge Template DNA visual decisions into a visual preset for CSS + preview. */
export function applyTemplateDnaToVisualPreset(
  preset: TemplateVisualPreset,
  dna: TemplateDNAProfile,
): TemplateVisualPreset {
  const sectionY =
    dna.spacing === "airy" ? "6.5rem" : dna.spacing === "compact" ? "3.5rem" : "5rem";
  const containerMax =
    dna.visualDensity === "minimal"
      ? "68rem"
      : dna.visualDensity === "rich"
        ? "80rem"
        : "74rem";
  const navVariant = mapNavVariant(dna.navigationProfile);
  const transparent = navVariant === "transparent-underline";

  return {
    ...preset,
    spacing: {
      ...preset.spacing,
      sectionY,
      sectionYMobile: dna.spacing === "compact" ? "2.5rem" : "3.5rem",
      containerMax,
      density:
        dna.visualDensity === "minimal"
          ? "airy"
          : dna.visualDensity === "rich"
            ? "compact"
            : "balanced",
    },
    layout: {
      ...preset.layout,
      heroVariant: mapHeroVariant(dna.heroProfile),
      navigationVariant: navVariant,
      footerVariant: mapFooterVariant(dna.footerProfile),
      sectionLayout: mapSectionLayout(dna.gridSystem),
      cardVariant: mapCardVariant(dna.cardProfile),
      cardsStyle:
        mapCardVariant(dna.cardProfile) === "glass"
          ? "glass"
          : mapCardVariant(dna.cardProfile) === "borderless"
            ? "borderless"
            : mapCardVariant(dna.cardProfile) === "soft-shadow"
              ? "soft-shadow"
              : "structured",
      componentStyle: dna.componentProfile,
      layoutVariant: String(dna.layoutProfile),
      heroLayout: `${dna.heroProfile} · ${dna.layoutProfile}`,
    },
    chrome: {
      ...preset.chrome,
      headerVariant: transparent ? "transparent" : "solid",
      navStyle:
        navVariant === "pill-modern"
          ? "pill"
          : navVariant === "transparent-underline"
            ? "underline"
            : "plain",
      footerVariant: (() => {
        const fv = mapFooterVariant(dna.footerProfile);
        return fv === "premium-red" ? "editorial" : fv;
      })(),
    },
  };
}
