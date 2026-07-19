import type {
  TemplateAnimationProfile,
  TemplateIntelligenceCategory,
  TemplateIntelligenceDefinition,
} from "@/lib/ai-core/template-intelligence/types";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";

const fadeUp: TemplateAnimationProfile = {
  id: "fade-up",
  label: "Fade up",
  entrance: "fadeUp 0.75s cubic-bezier(0.22,1,0.36,1)",
  hover: "subtle lift 4px",
  scroll: "section reveal on enter",
  reducedMotion: "disable transforms",
};

const cinematic: TemplateAnimationProfile = {
  id: "cinematic",
  label: "Cinematic",
  entrance: "slowReveal 1s cubic-bezier(0.22,1,0.36,1)",
  hover: "scale 1.02 media",
  scroll: "parallax-lite hero",
  reducedMotion: "opacity only",
};

const crisp: TemplateAnimationProfile = {
  id: "crisp",
  label: "Crisp SaaS",
  entrance: "fadeUp 0.55s ease-out",
  hover: "border glow",
  scroll: "stagger cards 70ms",
  reducedMotion: "instant",
};

function comps(
  ...ids: DesignRendererComponentId[]
): DesignRendererComponentId[] {
  return ids;
}

const CORE_LUXURY = comps(
  "SiteHeaderTransparent",
  "HeroLuxury",
  "FeatureStorytelling",
  "ServicesModern",
  "TestimonialsSlider",
  "CtaSplit",
  "ContactSection",
  "SiteFooter",
);

const CORE_MODERN = comps(
  "NavModern",
  "HeroSplit",
  "FeaturesModern",
  "ServicesModern",
  "TestimonialsModern",
  "PricingModern",
  "CtaSplit",
  "FaqAccordion",
  "SiteFooter",
);

const CORE_MINIMAL = comps(
  "SiteHeader",
  "HeroFullBleed",
  "FeatureHighlights",
  "ServicesGrid",
  "TestimonialsCarousel",
  "ContactCta",
  "SiteFooter",
);

const CORE_CORPORATE = comps(
  "SiteHeader",
  "HeroSplit",
  "ServicesModern",
  "ProcessSteps",
  "BrandTrust",
  "TestimonialsModern",
  "ContactSection",
  "SiteFooter",
);

const CORE_CREATIVE = comps(
  "SiteHeaderTransparent",
  "HeroCinematic",
  "GalleryExperience",
  "CaseStudies",
  "FeatureStorytelling",
  "CtaSplit",
  "ContactCta",
  "SiteFooter",
);

const CORE_TECH = comps(
  "NavModern",
  "HeroInteractive",
  "FeaturesBento",
  "ProductInteractive",
  "IntegrationsLogoCloud",
  "PricingModern",
  "FaqAccordion",
  "CtaBand",
  "SiteFooter",
);

const CORE_SAAS = comps(
  "NavModern",
  "HeroProduct",
  "FeaturesModern",
  "ProductInteractive",
  "PricingModern",
  "TestimonialsSlider",
  "FaqAccordion",
  "CtaSplit",
  "SiteFooter",
);

const CORE_AUTO = comps(
  "SiteHeaderTransparent",
  "HeroLuxuryShowcase",
  "VehicleShowcase",
  "VehicleComparison",
  "InventoryGrid",
  "FinanceCalculator",
  "TestimonialsSlider",
  "BranchesMap",
  "AppointmentCalendar",
  "BookingCta",
  "SiteFooter",
);

const CORE_RESTAURANT = comps(
  "SiteHeaderTransparent",
  "HeroCinematic",
  "MenuHighlights",
  "GalleryExperience",
  "FeatureStorytelling",
  "TestimonialsSlider",
  "ReservationSection",
  "MapsSection",
  "ContactCta",
  "SiteFooter",
);

const CORE_REAL_ESTATE = comps(
  "SiteHeader",
  "HeroProperty",
  "PropertyListings",
  "FeatureHighlights",
  "GalleryGrid",
  "TestimonialsModern",
  "LocationSections",
  "ContactSection",
  "SiteFooter",
);

export const TEMPLATE_INTELLIGENCE_CATALOG: TemplateIntelligenceDefinition[] = [
  {
    id: "ti-luxury-noir",
    name: "Luxury Noir",
    tagline: "Dark editorial luxury with gold restraint",
    description:
      "Cinematic full-bleed layouts, museum spacing, and premium serif display type.",
    category: "Luxury",
    industry: "business",
    designStyle: "Dark luxury editorial",
    designPreset: "luxury",
    layoutStructure: "editorial-hero",
    colors: {
      primary: "#1A1410",
      secondary: "#8B7355",
      accent: "#C9A227",
      background: "#0C0A09",
      foreground: "#F5F0E8",
      surface: "#14100E",
    },
    typography: {
      display: "Playfair Display",
      heading: "Playfair Display",
      body: "Source Sans 3",
    },
    components: CORE_LUXURY,
    animations: cinematic,
    brandPresetId: "luxury-brand",
    premiumTemplateId: "luxury-business",
    keywords: ["luxury", "premium", "noir", "gold", "editorial"],
    audienceHints: ["affluent", "executive", "luxury"],
    brandStyleHints: ["luxury", "premium", "cinematic"],
  },
  {
    id: "ti-modern-clean",
    name: "Modern Clean",
    tagline: "Bright product clarity with crisp hierarchy",
    description:
      "Balanced SaaS-friendly sections, strong CTAs, and contemporary sans typography.",
    category: "Modern",
    industry: "multi",
    designStyle: "Modern product",
    designPreset: "modern",
    layoutStructure: "product-saas",
    colors: {
      primary: "#0F172A",
      secondary: "#334155",
      accent: "#2563EB",
      background: "#F8FAFC",
      foreground: "#0F172A",
      surface: "#FFFFFF",
    },
    typography: {
      display: "Sora",
      heading: "Sora",
      body: "Inter",
    },
    components: CORE_MODERN,
    animations: fadeUp,
    brandPresetId: "premium-saas-brand",
    keywords: ["modern", "clean", "product", "startup"],
    audienceHints: ["startup", "smb", "product"],
    brandStyleHints: ["modern", "clean", "contemporary"],
  },
  {
    id: "ti-minimal-white",
    name: "Minimal White",
    tagline: "Quiet space, decisive type, almost no chrome",
    description:
      "Ultra-light surfaces, generous whitespace, and a focused conversion path.",
    category: "Minimal",
    industry: "multi",
    designStyle: "Minimal light",
    designPreset: "minimal",
    layoutStructure: "corporate-trust",
    colors: {
      primary: "#111111",
      secondary: "#6B7280",
      accent: "#111111",
      background: "#FFFFFF",
      foreground: "#111111",
      surface: "#F9FAFB",
    },
    typography: {
      display: "Instrument Sans",
      heading: "Instrument Sans",
      body: "Instrument Sans",
    },
    components: CORE_MINIMAL,
    animations: fadeUp,
    brandPresetId: "minimal-brand",
    keywords: ["minimal", "simple", "white", "quiet"],
    audienceHints: ["design-conscious", "creative", "professional"],
    brandStyleHints: ["minimal", "simple", "clean"],
  },
  {
    id: "ti-corporate-trust",
    name: "Corporate Trust",
    tagline: "Institutional clarity for serious buyers",
    description:
      "Process-forward layouts, proof bands, and trustworthy navy/teal systems.",
    category: "Corporate",
    industry: "business",
    designStyle: "Corporate professional",
    designPreset: "corporate",
    layoutStructure: "corporate-trust",
    colors: {
      primary: "#0B1F3A",
      secondary: "#1E3A5F",
      accent: "#0D9488",
      background: "#F4F7FB",
      foreground: "#0B1F3A",
      surface: "#FFFFFF",
    },
    typography: {
      display: "IBM Plex Sans",
      heading: "IBM Plex Sans",
      body: "IBM Plex Sans",
    },
    components: CORE_CORPORATE,
    animations: fadeUp,
    brandPresetId: "corporate-brand",
    premiumTemplateId: "luxury-business",
    keywords: ["corporate", "enterprise", "b2b", "trust"],
    audienceHints: ["enterprise", "b2b", "executive"],
    brandStyleHints: ["corporate", "professional", "trust"],
  },
  {
    id: "ti-creative-studio",
    name: "Creative Studio",
    tagline: "Portfolio energy with cinematic frames",
    description:
      "Asymmetric galleries, case-study storytelling, and expressive motion.",
    category: "Creative",
    industry: "agency",
    designStyle: "Creative agency",
    designPreset: "creative",
    layoutStructure: "studio-portfolio",
    colors: {
      primary: "#111111",
      secondary: "#F97316",
      accent: "#EC4899",
      background: "#0A0A0A",
      foreground: "#FAFAFA",
      surface: "#171717",
    },
    typography: {
      display: "Syne",
      heading: "Syne",
      body: "Manrope",
    },
    components: CORE_CREATIVE,
    animations: cinematic,
    brandPresetId: "creative-brand",
    premiumTemplateId: "agency",
    keywords: ["creative", "agency", "studio", "portfolio"],
    audienceHints: ["creative", "brand", "agency"],
    brandStyleHints: ["creative", "bold", "artistic"],
  },
  {
    id: "ti-technology-dark",
    name: "Technology Dark",
    tagline: "Product frames on luminous technical surfaces",
    description:
      "Dark glass UI, geometric clarity, and product-led storytelling.",
    category: "Technology",
    industry: "saas",
    designStyle: "Technology dark",
    designPreset: "tech",
    layoutStructure: "product-saas",
    colors: {
      primary: "#6366F1",
      secondary: "#22D3EE",
      accent: "#A78BFA",
      background: "#030712",
      foreground: "#F8FAFC",
      surface: "#111827",
    },
    typography: {
      display: "Space Grotesk",
      heading: "Space Grotesk",
      body: "IBM Plex Sans",
    },
    components: CORE_TECH,
    animations: crisp,
    brandPresetId: "technology-brand",
    premiumTemplateId: "saas",
    keywords: ["technology", "tech", "ai", "platform", "hardware"],
    audienceHints: ["developer", "tech", "innovator"],
    brandStyleHints: ["technology", "tech", "innovative"],
  },
  {
    id: "ti-saas-growth",
    name: "SaaS Growth",
    tagline: "Conversion-ready product marketing",
    description:
      "Feature grids, pricing clarity, proof, and demo-first CTAs.",
    category: "SaaS",
    industry: "saas",
    designStyle: "Premium SaaS",
    designPreset: "modern",
    layoutStructure: "product-saas",
    colors: {
      primary: "#4F46E5",
      secondary: "#0EA5E9",
      accent: "#10B981",
      background: "#F8FAFC",
      foreground: "#0F172A",
      surface: "#FFFFFF",
    },
    typography: {
      display: "Sora",
      heading: "Sora",
      body: "Inter",
    },
    components: CORE_SAAS,
    animations: crisp,
    brandPresetId: "premium-saas-brand",
    premiumTemplateId: "saas",
    keywords: ["saas", "software", "subscription", "b2b", "product"],
    audienceHints: ["founder", "ops", "product team"],
    brandStyleHints: ["saas", "startup", "product"],
  },
  {
    id: "ti-automotive-showroom",
    name: "Automotive Showroom",
    tagline: "Luxury vehicle stage with inventory & finance",
    description:
      "Dark showroom hero, vehicle cards, filters, calculator, and appointments.",
    category: "Automotive",
    industry: "automotive",
    designStyle: "Dark luxury showroom",
    designPreset: "luxury",
    layoutStructure: "vehicle-showroom",
    colors: {
      primary: "#0B0B0F",
      secondary: "#E11D48",
      accent: "#A1A1AA",
      background: "#111113",
      foreground: "#FAFAFA",
      surface: "#18181B",
    },
    typography: {
      display: "Oswald",
      heading: "Oswald",
      body: "IBM Plex Sans",
    },
    components: CORE_AUTO,
    animations: cinematic,
    brandPresetId: "luxury-brand",
    premiumTemplateId: "automotive",
    keywords: ["automotive", "car", "dealership", "vehicle", "ev"],
    audienceHints: ["buyer", "enthusiast", "luxury"],
    brandStyleHints: ["automotive", "performance", "luxury"],
  },
  {
    id: "ti-restaurant-dining",
    name: "Restaurant Dining",
    tagline: "Atmospheric fine dining with reservation flow",
    description:
      "Cinematic food photography, menu highlights, and booking-first CTAs.",
    category: "Restaurant",
    industry: "restaurant",
    designStyle: "Dining atmosphere",
    designPreset: "luxury",
    layoutStructure: "editorial-hero",
    colors: {
      primary: "#1C1917",
      secondary: "#78716C",
      accent: "#D6A45B",
      background: "#0C0A09",
      foreground: "#FAF7F2",
      surface: "#1C1917",
    },
    typography: {
      display: "Cormorant Garamond",
      heading: "Cormorant Garamond",
      body: "Outfit",
    },
    components: CORE_RESTAURANT,
    animations: cinematic,
    brandPresetId: "luxury-brand",
    premiumTemplateId: "restaurant",
    keywords: ["restaurant", "dining", "chef", "menu", "hospitality"],
    audienceHints: ["diner", "local", "foodie"],
    brandStyleHints: ["restaurant", "hospitality", "culinary"],
  },
  {
    id: "ti-real-estate-listings",
    name: "Real Estate Listings",
    tagline: "Property-forward trust and inquiry paths",
    description:
      "Listing grids, neighborhood proof, and clean inquire/schedule flows.",
    category: "Real Estate",
    industry: "real-estate",
    designStyle: "Property showcase",
    designPreset: "corporate",
    layoutStructure: "property-showcase",
    colors: {
      primary: "#1E293B",
      secondary: "#64748B",
      accent: "#0F766E",
      background: "#F8FAFC",
      foreground: "#0F172A",
      surface: "#FFFFFF",
    },
    typography: {
      display: "Libre Franklin",
      heading: "Libre Franklin",
      body: "Source Sans 3",
    },
    components: CORE_REAL_ESTATE,
    animations: fadeUp,
    brandPresetId: "corporate-brand",
    premiumTemplateId: "real-estate",
    keywords: ["real estate", "property", "homes", "listings", "realtor"],
    audienceHints: ["buyer", "seller", "investor"],
    brandStyleHints: ["real estate", "property", "trust"],
  },
  {
    id: "ti-luxury-brands-atelier",
    name: "Luxury Brands Atelier",
    tagline: "Couture stillness for premium product houses",
    description:
      "Full-bleed product storytelling, restrained type, and museum spacing for luxury brands.",
    category: "Luxury",
    industry: "business",
    designStyle: "Luxury brand atelier",
    designPreset: "luxury",
    layoutStructure: "editorial-hero",
    colors: {
      primary: "#0A0A0A",
      secondary: "#6B5B4F",
      accent: "#D4AF37",
      background: "#050505",
      foreground: "#F7F3EC",
      surface: "#121212",
    },
    typography: {
      display: "Cormorant Garamond",
      heading: "Cormorant Garamond",
      body: "Neue Haas Grotesk",
    },
    components: CORE_LUXURY,
    animations: cinematic,
    brandPresetId: "luxury-brand",
    premiumTemplateId: "luxury-business",
    keywords: ["luxury brand", "fashion", "jewelry", "atelier", "premium"],
    audienceHints: ["affluent", "collectors", "vip"],
    brandStyleHints: ["luxury", "couture", "premium brand"],
  },
  {
    id: "ti-ai-company-signal",
    name: "AI Company Signal",
    tagline: "Dark technical clarity for AI platforms",
    description:
      "Product-led hero, capability grids, and high-contrast tech motion for AI companies.",
    category: "Technology",
    industry: "saas",
    designStyle: "AI product dark",
    designPreset: "tech",
    layoutStructure: "product-saas",
    colors: {
      primary: "#070B14",
      secondary: "#334155",
      accent: "#38BDF8",
      background: "#030712",
      foreground: "#E2E8F0",
      surface: "#0F172A",
    },
    typography: {
      display: "Space Grotesk",
      heading: "Space Grotesk",
      body: "Inter",
    },
    components: CORE_TECH,
    animations: crisp,
    brandPresetId: "technology-brand",
    premiumTemplateId: "saas",
    keywords: ["ai", "artificial intelligence", "ml", "platform", "model"],
    audienceHints: ["cto", "builders", "enterprise"],
    brandStyleHints: ["ai", "technology", "futuristic"],
  },
  {
    id: "ti-software-studio",
    name: "Software Studio",
    tagline: "Clean product narrative for software companies",
    description:
      "Split hero, feature storytelling, pricing, and FAQ tuned for software businesses.",
    category: "Technology",
    industry: "saas",
    designStyle: "Software product modern",
    designPreset: "modern",
    layoutStructure: "product-saas",
    colors: {
      primary: "#0F172A",
      secondary: "#475569",
      accent: "#6366F1",
      background: "#FFFFFF",
      foreground: "#0F172A",
      surface: "#F8FAFC",
    },
    typography: {
      display: "Satoshi",
      heading: "Satoshi",
      body: "Inter",
    },
    components: CORE_SAAS,
    animations: crisp,
    brandPresetId: "technology-brand",
    premiumTemplateId: "saas",
    keywords: ["software", "developer", "app", "platform", "tech company"],
    audienceHints: ["businesses", "teams", "developers"],
    brandStyleHints: ["software", "modern", "product"],
  },
  {
    id: "ti-consulting-clarity",
    name: "Consulting Clarity",
    tagline: "Trust-first layouts for advisory firms",
    description:
      "Corporate rhythm with process steps, proof, and calm inquiry CTAs for consulting.",
    category: "Corporate",
    industry: "business",
    designStyle: "Consulting trust",
    designPreset: "corporate",
    layoutStructure: "corporate-trust",
    colors: {
      primary: "#0B1F33",
      secondary: "#4A5568",
      accent: "#B08D57",
      background: "#F7F5F2",
      foreground: "#0B1F33",
      surface: "#FFFFFF",
    },
    typography: {
      display: "Libre Baskerville",
      heading: "Libre Baskerville",
      body: "Source Sans 3",
    },
    components: CORE_CORPORATE,
    animations: fadeUp,
    brandPresetId: "corporate-brand",
    premiumTemplateId: "agency",
    keywords: ["consulting", "advisory", "strategy", "firm"],
    audienceHints: ["executives", "founders", "boards"],
    brandStyleHints: ["consulting", "corporate", "trust"],
  },
  {
    id: "ti-finance-ledger",
    name: "Finance Ledger",
    tagline: "Precise, calm systems for financial services",
    description:
      "Structured sections, credibility bands, and clear CTAs for finance brands.",
    category: "Corporate",
    industry: "business",
    designStyle: "Finance precision",
    designPreset: "corporate",
    layoutStructure: "corporate-trust",
    colors: {
      primary: "#0C2340",
      secondary: "#5C6B7A",
      accent: "#1B7F5A",
      background: "#F4F7FA",
      foreground: "#0C2340",
      surface: "#FFFFFF",
    },
    typography: {
      display: "IBM Plex Sans",
      heading: "IBM Plex Sans",
      body: "IBM Plex Sans",
    },
    components: CORE_CORPORATE,
    animations: fadeUp,
    brandPresetId: "corporate-brand",
    keywords: ["finance", "banking", "wealth", "invest", "fintech"],
    audienceHints: ["clients", "investors", "savers"],
    brandStyleHints: ["finance", "trust", "precise"],
  },
  {
    id: "ti-agency-portfolio",
    name: "Agency Portfolio",
    tagline: "Work-first creative studio systems",
    description:
      "Case-led layouts, expressive type, and studio contact flows for agencies.",
    category: "Creative",
    industry: "agency",
    designStyle: "Creative agency portfolio",
    designPreset: "creative",
    layoutStructure: "studio-portfolio",
    colors: {
      primary: "#111111",
      secondary: "#6B7280",
      accent: "#F43F5E",
      background: "#FAFAFA",
      foreground: "#111111",
      surface: "#FFFFFF",
    },
    typography: {
      display: "Editorial New",
      heading: "Editorial New",
      body: "Inter",
    },
    components: CORE_CREATIVE,
    animations: cinematic,
    brandPresetId: "creative-brand",
    premiumTemplateId: "agency",
    keywords: ["agency", "portfolio", "studio", "creative", "work"],
    audienceHints: ["brands", "founders", "marketers"],
    brandStyleHints: ["creative", "agency", "portfolio"],
  },
  {
    id: "ti-hotel-sanctuary",
    name: "Hotel Sanctuary",
    tagline: "Atmospheric hospitality for hotels & resorts",
    description:
      "Cinematic stays, amenity storytelling, gallery rhythm, and booking CTAs.",
    category: "Restaurant",
    industry: "tourism",
    designStyle: "Hotel sanctuary",
    designPreset: "luxury",
    layoutStructure: "travel-premium",
    colors: {
      primary: "#1C1917",
      secondary: "#78716C",
      accent: "#A8A29E",
      background: "#0C0A09",
      foreground: "#FAF7F2",
      surface: "#1C1917",
    },
    typography: {
      display: "Freight Display",
      heading: "Freight Display",
      body: "Söhne",
    },
    components: CORE_RESTAURANT,
    animations: cinematic,
    brandPresetId: "luxury-brand",
    premiumTemplateId: "tourism",
    keywords: ["hotel", "resort", "stay", "hospitality", "rooms"],
    audienceHints: ["travelers", "guests", "couples"],
    brandStyleHints: ["hotel", "hospitality", "luxury travel"],
  },
  {
    id: "ti-travel-horizon",
    name: "Travel Horizon",
    tagline: "Destination-led journeys for travel brands",
    description:
      "Immersive destination hero, itinerary sections, and booking-forward CTAs.",
    category: "Creative",
    industry: "tourism",
    designStyle: "Travel horizon",
    designPreset: "creative",
    layoutStructure: "travel-premium",
    colors: {
      primary: "#0E7490",
      secondary: "#155E75",
      accent: "#F59E0B",
      background: "#ECFEFF",
      foreground: "#083344",
      surface: "#FFFFFF",
    },
    typography: {
      display: "Cabinet Grotesk",
      heading: "Cabinet Grotesk",
      body: "Inter",
    },
    components: CORE_MODERN,
    animations: fadeUp,
    brandPresetId: "creative-brand",
    premiumTemplateId: "tourism",
    keywords: ["travel", "tour", "destination", "trip", "adventure"],
    audienceHints: ["travelers", "families", "explorers"],
    brandStyleHints: ["travel", "adventure", "destination"],
  },
  {
    id: "ti-ecommerce-atelier",
    name: "Ecommerce Atelier",
    tagline: "Product-first commerce for modern brands",
    description:
      "Collection hero, product grids, brand story, and conversion CTAs for ecommerce.",
    category: "Modern",
    industry: "ecommerce",
    designStyle: "Ecommerce atelier",
    designPreset: "modern",
    layoutStructure: "commerce-grid",
    colors: {
      primary: "#18181B",
      secondary: "#71717A",
      accent: "#E11D48",
      background: "#FAFAFA",
      foreground: "#18181B",
      surface: "#FFFFFF",
    },
    typography: {
      display: "GT America",
      heading: "GT America",
      body: "Inter",
    },
    components: CORE_MODERN,
    animations: crisp,
    brandPresetId: "premium-saas-brand",
    premiumTemplateId: "ecommerce",
    keywords: ["ecommerce", "shop", "store", "product", "commerce"],
    audienceHints: ["shoppers", "customers", "subscribers"],
    brandStyleHints: ["ecommerce", "product brand", "retail"],
  },
];

export function listTemplateIntelligence(filters?: {
  category?: TemplateIntelligenceCategory | "all";
  industry?: string;
  query?: string;
}): TemplateIntelligenceDefinition[] {
  const category = filters?.category || "all";
  const industry = (filters?.industry || "").toLowerCase().trim();
  const q = (filters?.query || "").toLowerCase().trim();

  return TEMPLATE_INTELLIGENCE_CATALOG.filter((tpl) => {
    if (category !== "all" && tpl.category !== category) return false;
    if (industry && industry !== "multi") {
      const matchIndustry =
        tpl.industry === "multi" ||
        tpl.industry === industry ||
        tpl.keywords.some((k) => industry.includes(k) || k.includes(industry));
      if (!matchIndustry && category === "all") {
        // still allow style categories when browsing all
      }
    }
    if (q) {
      const hay = [
        tpl.name,
        tpl.tagline,
        tpl.description,
        tpl.category,
        tpl.designStyle,
        ...tpl.keywords,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function getTemplateIntelligence(
  id: string,
): TemplateIntelligenceDefinition | null {
  return TEMPLATE_INTELLIGENCE_CATALOG.find((t) => t.id === id) || null;
}

export function isTemplateIntelligenceId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    TEMPLATE_INTELLIGENCE_CATALOG.some((t) => t.id === value)
  );
}
