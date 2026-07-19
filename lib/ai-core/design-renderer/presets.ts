import type { IndustryId } from "@/lib/ai-core/templates/types";
import type {
  DesignRendererComponentId,
  DesignRendererVisualStyle,
} from "@/lib/ai-core/design-renderer/types";

export type IndustryDesignPresetSection = {
  name: string;
  componentId: DesignRendererComponentId;
  page?: string;
  goal?: string;
  contentNotes?: string;
  assetRole?:
    | "hero"
    | "product"
    | "service"
    | "section"
    | "background"
    | "gallery"
    | "testimonial";
};

export type IndustryDesignPreset = {
  industryId: IndustryId;
  label: string;
  layoutStyle: string;
  visualStyle: DesignRendererVisualStyle;
  /** Ordered home sections (agency-grade). */
  homeSections: IndustryDesignPresetSection[];
  /** Extra page → section mappings. */
  pageSections?: Record<string, IndustryDesignPresetSection[]>;
  layoutRules: string[];
};

/**
 * Premium industry design presets for the AI Design Renderer Engine.
 */
export const INDUSTRY_DESIGN_PRESETS: Partial<
  Record<IndustryId, IndustryDesignPreset>
> = {
  tourism: {
    industryId: "tourism",
    label: "Tourism",
    layoutStyle: "travel-premium",
    visualStyle: {
      layoutStyle: "travel-premium",
      density: "airy",
      heroTreatment: "Full hero image — cinematic destination, edge-to-edge",
      cardTreatment: "Soft elevated destination/tour cards with imagery",
      ctaTreatment: "Warm accent solid buttons + secondary outline explore",
      motionNotes: "Slow ken-burns hero feel via CSS; soft fade-in for cards",
      uiPatterns: [
        "full-bleed cinematic hero",
        "destination mosaic gallery",
        "tour package cards",
        "booking form panel",
        "testimonial cards",
        "full-width travel CTA",
      ],
    },
    homeSections: [
      {
        name: "Hero destination",
        componentId: "HeroFullBleed",
        goal: "Immersive travel hero with primary Book CTA",
        contentNotes: "Full-bleed destination photography; dual CTAs Book / Explore",
        assetRole: "hero",
      },
      {
        name: "Destinations gallery",
        componentId: "DestinationsGallery",
        goal: "Showcase destinations",
        contentNotes: "Image mosaic of 4–8 destinations with explore links",
        assetRole: "section",
      },
      {
        name: "Tour packages",
        componentId: "TourPackagesGrid",
        goal: "Present bookable tour packages",
        contentNotes: "Duration, highlights, from-price, Book package CTA",
        assetRole: "product",
      },
      {
        name: "Booking section",
        componentId: "BookingSection",
        goal: "Capture booking intent",
        contentNotes: "Dates, travelers, preferred package, submit",
      },
      {
        name: "Testimonials",
        componentId: "TestimonialsCarousel",
        goal: "Traveler social proof",
        contentNotes: "Quotes from travelers with destination context",
      },
      {
        name: "Travel CTA",
        componentId: "TravelCtaBand",
        goal: "Final conversion to booking",
        contentNotes: "Travel CTA band with Book a trip",
      },
    ],
    pageSections: {
      Destinations: [
        {
          name: "Destinations gallery",
          componentId: "DestinationsGallery",
          assetRole: "section",
        },
      ],
      Tours: [
        {
          name: "Tour packages",
          componentId: "TourPackagesGrid",
          assetRole: "product",
        },
      ],
      Packages: [
        {
          name: "Tour packages",
          componentId: "TourPackagesGrid",
          assetRole: "product",
        },
      ],
      Booking: [
        { name: "Booking section", componentId: "BookingSection" },
      ],
      Testimonials: [
        { name: "Testimonials", componentId: "TestimonialsCarousel" },
      ],
      Contact: [{ name: "Contact", componentId: "ContactCta" }],
    },
    layoutRules: [
      "Home opens with full-bleed hero — no inset media cards in first viewport",
      "Destinations gallery uses image-first cards before dense copy",
      "Booking section appears before final travel CTA",
      "Prefer cinematic photography over abstract gradients",
    ],
  },
  automotive: {
    industryId: "automotive",
    label: "Automotive",
    layoutStyle: "vehicle-showroom",
    visualStyle: {
      layoutStyle: "vehicle-showroom",
      density: "airy",
      heroTreatment: "Luxury hero — dark stage, flagship vehicle dominant",
      cardTreatment: "Image-forward luxury vehicle cards with metallic edges",
      ctaTreatment: "High-contrast primary Book test drive CTA",
      motionNotes: "Soft card reveals; restrained showroom motion",
      uiPatterns: [
        "luxury vehicle hero",
        "luxury vehicle showcase cards",
        "vehicle detail layout",
        "filterable inventory grid",
        "finance calculator",
        "appointment booking calendar",
        "vehicle comparison table",
        "premium testimonial slider",
        "branch location section",
        "booking CTA band",
      ],
    },
    homeSections: [
      {
        name: "Luxury hero",
        componentId: "HeroLuxuryShowcase",
        goal: "Premium brand + flagship vehicle",
        contentNotes: "Dark luxury hero, model name, Book a test drive",
        assetRole: "hero",
      },
      {
        name: "Vehicle showcase",
        componentId: "VehicleShowcase",
        goal: "Feature key models",
        contentNotes: "Luxury showcase cards with imagery, trim, and details CTA",
        assetRole: "product",
      },
      {
        name: "Compare models",
        componentId: "VehicleComparison",
        goal: "Help buyers choose",
        contentNotes: "Side-by-side comparison table",
      },
      {
        name: "Inventory",
        componentId: "InventoryGrid",
        goal: "Browse available vehicles",
        contentNotes: "Filterable stock cards with price and inquire CTA",
        assetRole: "product",
      },
      {
        name: "Finance",
        componentId: "FinanceCalculator",
        goal: "Clarify monthly ownership cost",
        contentNotes: "Interactive payment estimator",
      },
      {
        name: "Owner stories",
        componentId: "TestimonialsSlider",
        goal: "Social proof",
        contentNotes: "Premium testimonial slider",
        assetRole: "testimonial",
      },
      {
        name: "Branches",
        componentId: "BranchesMap",
        goal: "Show dealership locations",
        contentNotes: "Branch cards with hours, phone, and map panel",
      },
      {
        name: "Appointments",
        componentId: "AppointmentCalendar",
        goal: "Book a test drive",
        contentNotes: "Calendar with day, time, and model selection",
      },
      {
        name: "Booking CTA",
        componentId: "BookingCta",
        goal: "Convert to appointment",
        contentNotes: "Strong booking CTA band",
      },
    ],
    pageSections: {
      Inventory: [
        {
          name: "Inventory",
          componentId: "InventoryGrid",
          assetRole: "product",
        },
        {
          name: "Finance",
          componentId: "FinanceCalculator",
        },
      ],
      Models: [
        {
          name: "Vehicle showcase",
          componentId: "VehicleShowcase",
          assetRole: "product",
        },
        {
          name: "Vehicle detail",
          componentId: "VehicleDetail",
          assetRole: "product",
        },
        {
          name: "Compare",
          componentId: "VehicleComparison",
        },
      ],
      Finance: [
        {
          name: "Finance calculator",
          componentId: "FinanceCalculator",
        },
      ],
      Services: [
        {
          name: "Services",
          componentId: "ServicesGrid",
          assetRole: "service",
        },
        {
          name: "Appointments",
          componentId: "AppointmentCalendar",
        },
      ],
      Contact: [
        { name: "Branches", componentId: "BranchesMap" },
        { name: "Appointments", componentId: "AppointmentCalendar" },
        { name: "Contact", componentId: "ContactCta" },
      ],
    },
    layoutRules: [
      "Luxury hero is dark, full-bleed, vehicle-forward",
      "Showcase cards before inventory filters",
      "Include finance calculator and comparison table on home",
      "Branches before appointment calendar and final booking CTA",
      "Prefer photoreal vehicle imagery and generous section spacing",
      "Vehicle detail pages live under /models/[slug]",
    ],
  },
  "real-estate": {
    industryId: "real-estate",
    label: "Real Estate",
    layoutStyle: "property-showcase",
    visualStyle: {
      layoutStyle: "property-showcase",
      density: "balanced",
      heroTreatment: "Property hero with search + featured listing imagery",
      cardTreatment: "Clean listing cards with photo-dominant media",
      ctaTreatment: "Corporate solid inquire / schedule viewing CTAs",
      motionNotes: "Soft card hover lifts; calm transitions",
      uiPatterns: [
        "property search hero",
        "property listing cards",
        "feature highlight rows",
        "neighborhood / location blocks",
        "contact CTA + form",
      ],
    },
    homeSections: [
      {
        name: "Property hero",
        componentId: "HeroProperty",
        goal: "Search-led property discovery",
        contentNotes: "Hero with search cue and aspirational property image",
        assetRole: "hero",
      },
      {
        name: "Listings",
        componentId: "PropertyListings",
        goal: "Featured listings",
        contentNotes: "Photo, price, beds/baths, View details",
        assetRole: "product",
      },
      {
        name: "Features",
        componentId: "FeatureHighlights",
        goal: "Buying/selling differentiators",
        contentNotes: "Process benefits and trust signals",
        assetRole: "section",
      },
      {
        name: "Location sections",
        componentId: "LocationSections",
        goal: "Neighborhood value",
        contentNotes: "Location blocks with lifestyle highlights",
        assetRole: "section",
      },
      {
        name: "Contact CTA",
        componentId: "ContactCta",
        goal: "Capture inquiry",
        contentNotes: "Inquiry form + Schedule a viewing CTA",
      },
    ],
    pageSections: {
      Listings: [
        {
          name: "Listings",
          componentId: "PropertyListings",
          assetRole: "product",
        },
      ],
      Neighborhoods: [
        {
          name: "Location sections",
          componentId: "LocationSections",
          assetRole: "section",
        },
      ],
      Contact: [{ name: "Contact CTA", componentId: "ContactCta" }],
    },
    layoutRules: [
      "Property hero leads with search affordance and listing imagery",
      "Listings before features/location storytelling",
      "Contact CTA closes home conversion",
      "Listing cards are photo-first; avoid text-only property rows",
    ],
  },
  saas: {
    industryId: "saas",
    label: "SaaS",
    layoutStyle: "product-saas",
    visualStyle: {
      layoutStyle: "product-saas",
      density: "balanced",
      heroTreatment: "Product hero with UI mock and trial/demo CTAs",
      cardTreatment: "Modern bento/feature cards; clear pricing tiers",
      ctaTreatment: "Primary Start free trial + secondary Book a demo",
      motionNotes: "Light UI motion; feature card stagger",
      uiPatterns: [
        "product SaaS hero",
        "bento feature grid",
        "pricing tiers",
        "logo cloud",
        "FAQ accordion",
      ],
    },
    homeSections: [
      {
        name: "Product hero",
        componentId: "HeroProduct",
        goal: "State product value instantly",
        contentNotes: "Headline, subcopy, trial/demo CTAs, product visual",
        assetRole: "hero",
      },
      {
        name: "Features",
        componentId: "FeaturesBento",
        goal: "Show product capabilities",
        contentNotes: "Bento feature grid with icons and benefits",
        assetRole: "product",
      },
      {
        name: "Pricing",
        componentId: "PricingTable",
        goal: "Clarify plans",
        contentNotes: "3 tiers with featured plan emphasis",
      },
      {
        name: "Integrations",
        componentId: "IntegrationsLogoCloud",
        goal: "Ecosystem trust",
        contentNotes: "Integration logos + short line",
      },
      {
        name: "FAQ",
        componentId: "FaqAccordion",
        goal: "Handle objections",
        contentNotes: "Pricing, security, onboarding FAQs",
      },
      {
        name: "Final CTA",
        componentId: "CtaBand",
        goal: "Convert to trial/demo",
        contentNotes: "Closing CTA band",
      },
    ],
    pageSections: {
      Features: [
        {
          name: "Features",
          componentId: "FeaturesBento",
          assetRole: "product",
        },
      ],
      Pricing: [{ name: "Pricing", componentId: "PricingTable" }],
      Contact: [{ name: "Contact", componentId: "ContactCta" }],
    },
    layoutRules: [
      "Product hero is UI-forward with clear trial/demo CTAs",
      "Features before pricing; integrations before FAQ",
      "FAQ precedes final CTA band",
      "Prefer product screenshots/mocks over decorative blobs",
    ],
  },
  restaurant: {
    industryId: "restaurant",
    label: "Restaurant",
    layoutStyle: "editorial-hero",
    visualStyle: {
      layoutStyle: "editorial-hero",
      density: "airy",
      heroTreatment: "Editorial food/ambiance hero",
      cardTreatment: "Warm menu highlight cards",
      ctaTreatment: "Reserve a table primary CTA",
      motionNotes: "Soft fade for menu cards",
      uiPatterns: [
        "full-bleed cinematic hero",
        "menu highlight cards",
        "reservation form",
        "testimonial cards",
      ],
    },
    homeSections: [
      {
        name: "Hero",
        componentId: "HeroFullBleed",
        assetRole: "hero",
      },
      {
        name: "Menu highlights",
        componentId: "MenuHighlights",
        assetRole: "product",
      },
      {
        name: "Reservations",
        componentId: "ReservationSection",
      },
      {
        name: "Testimonials",
        componentId: "TestimonialsCarousel",
      },
      { name: "Contact", componentId: "ContactCta" },
    ],
    layoutRules: [
      "Food imagery leads; reservation section mid-page",
      "Warm hospitality typography and spacing",
    ],
  },
  clinic: {
    industryId: "clinic",
    label: "Healthcare",
    layoutStyle: "corporate-trust",
    visualStyle: {
      layoutStyle: "corporate-trust",
      density: "balanced",
      heroTreatment: "Calm care hero with appointment CTA",
      cardTreatment: "Soft trust cards for services/doctors",
      ctaTreatment: "Book appointment primary CTA",
      motionNotes: "Minimal, reassuring motion",
      uiPatterns: [
        "corporate-trust hero",
        "care services grid",
        "clinician profiles",
        "booking CTA band",
      ],
    },
    homeSections: [
      {
        name: "Hero",
        componentId: "HeroProperty",
        assetRole: "hero",
        contentNotes: "Calm healthcare hero; Book appointment CTA",
      },
      {
        name: "Care services",
        componentId: "CareServices",
        assetRole: "service",
      },
      {
        name: "Doctors",
        componentId: "DoctorProfiles",
        assetRole: "section",
      },
      { name: "Appointments", componentId: "BookingCta" },
      {
        name: "Patient stories",
        componentId: "TestimonialsCarousel",
      },
      { name: "Contact", componentId: "ContactCta" },
    ],
    layoutRules: [
      "Trust-first hierarchy: services → clinicians → booking",
      "Avoid aggressive sales patterns; keep accessibility high",
    ],
  },
  education: {
    industryId: "education",
    label: "Education",
    layoutStyle: "campus-education",
    visualStyle: {
      layoutStyle: "campus-education",
      density: "balanced",
      heroTreatment: "Campus/program hero with Apply CTA",
      cardTreatment: "Program cards with outcomes",
      ctaTreatment: "Apply now / Explore programs",
      motionNotes: "Light card reveal",
      uiPatterns: [
        "campus hero",
        "education programs grid",
        "admissions CTA",
        "FAQ accordion",
      ],
    },
    homeSections: [
      {
        name: "Hero",
        componentId: "HeroProduct",
        assetRole: "hero",
        contentNotes: "Education hero with Apply now CTA",
      },
      {
        name: "Programs",
        componentId: "ProgramsGrid",
        assetRole: "product",
      },
      {
        name: "Features",
        componentId: "FeatureHighlights",
        assetRole: "section",
      },
      { name: "Admissions CTA", componentId: "AdmissionsCta" },
      { name: "FAQ", componentId: "FaqAccordion" },
      { name: "Contact", componentId: "ContactCta" },
    ],
    layoutRules: [
      "Programs before admissions CTA",
      "Outcomes-focused copy in program cards",
    ],
  },
  ecommerce: {
    industryId: "ecommerce",
    label: "E-commerce",
    layoutStyle: "commerce-grid",
    visualStyle: {
      layoutStyle: "commerce-grid",
      density: "compact",
      heroTreatment: "Offer hero with Shop now CTA",
      cardTreatment: "Commerce product cards",
      ctaTreatment: "Shop now / View collections",
      motionNotes: "Quick card hovers",
      uiPatterns: [
        "commerce hero",
        "product commerce grid",
        "collections grid",
        "FAQ accordion",
      ],
    },
    homeSections: [
      {
        name: "Hero offer",
        componentId: "HeroProduct",
        assetRole: "hero",
      },
      {
        name: "Featured products",
        componentId: "ProductGrid",
        assetRole: "product",
      },
      {
        name: "Collections",
        componentId: "CollectionsGrid",
        assetRole: "section",
      },
      { name: "Social proof", componentId: "SocialProof" },
      { name: "FAQ", componentId: "FaqAccordion" },
      { name: "CTA", componentId: "CtaBand" },
    ],
    layoutRules: [
      "Products and collections dominate above FAQ",
      "Clear Shop now CTAs on hero and product cards",
    ],
  },
  agency: {
    industryId: "agency",
    label: "Agency",
    layoutStyle: "studio-portfolio",
    visualStyle: {
      layoutStyle: "studio-portfolio",
      density: "airy",
      heroTreatment: "Studio hero with Start a project CTA",
      cardTreatment: "Portfolio case cards",
      ctaTreatment: "Start a project / Book a call",
      motionNotes: "Editorial reveal on portfolio",
      uiPatterns: [
        "studio hero",
        "portfolio case grid",
        "service cards",
        "numbered process",
        "contact CTA + form",
      ],
    },
    homeSections: [
      {
        name: "Hero",
        componentId: "HeroFullBleed",
        assetRole: "hero",
      },
      {
        name: "Selected work",
        componentId: "PortfolioGrid",
        assetRole: "section",
      },
      {
        name: "Services",
        componentId: "ServicesGrid",
        assetRole: "service",
      },
      { name: "Process", componentId: "ProcessSteps" },
      {
        name: "Testimonials",
        componentId: "TestimonialsCarousel",
      },
      { name: "Contact", componentId: "ContactCta" },
    ],
    layoutRules: [
      "Work before services — prove craft first",
      "Process then testimonials then contact",
    ],
  },
};

export function getIndustryDesignPreset(
  industryId: IndustryId,
): IndustryDesignPreset | null {
  return INDUSTRY_DESIGN_PRESETS[industryId] ?? null;
}
