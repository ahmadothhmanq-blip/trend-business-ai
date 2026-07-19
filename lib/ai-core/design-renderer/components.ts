import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";

export type DesignRendererComponentSpec = {
  id: DesignRendererComponentId;
  /** PascalCase React component name. */
  exportName: string;
  path: string;
  pattern: string;
  description: string;
  defaultGoal: string;
};

/** Registry of real UI components generation must implement. */
export const DESIGN_RENDERER_COMPONENTS: Record<
  DesignRendererComponentId,
  DesignRendererComponentSpec
> = {
  SiteHeader: {
    id: "SiteHeader",
    exportName: "SiteHeader",
    path: "components/layout/site-header.tsx",
    pattern: "sticky nav + CTA",
    description: "Responsive site header with logo, nav links, and primary CTA.",
    defaultGoal: "Guide visitors through primary pages",
  },
  SiteHeaderTransparent: {
    id: "SiteHeaderTransparent",
    exportName: "SiteHeaderTransparent",
    path: "components/layout/site-header-transparent.tsx",
    pattern: "transparent overlay nav",
    description:
      "Transparent-to-solid navigation for cinematic/luxury heroes with mobile drawer.",
    defaultGoal: "Keep brand present without covering the hero",
  },
  NavModern: {
    id: "NavModern",
    exportName: "NavModern",
    path: "components/layout/nav-modern.tsx",
    pattern: "modern pill nav",
    description:
      "Modern navigation with pill CTA, underline active states, and mobile sheet menu.",
    defaultGoal: "Provide a polished conversion-ready navigation",
  },
  SiteFooter: {
    id: "SiteFooter",
    exportName: "SiteFooter",
    path: "components/layout/site-footer.tsx",
    pattern: "multi-column footer",
    description: "Footer with columns, legal links, and optional newsletter.",
    defaultGoal: "Close the page with trust and secondary navigation",
  },
  HeroFullBleed: {
    id: "HeroFullBleed",
    exportName: "HeroFullBleed",
    path: "components/sections/hero-full-bleed.tsx",
    pattern: "full-bleed cinematic hero",
    description: "Edge-to-edge hero image with headline, subcopy, and dual CTAs.",
    defaultGoal: "Create immediate destination desire",
  },
  HeroCinematic: {
    id: "HeroCinematic",
    exportName: "HeroCinematic",
    path: "components/sections/hero-cinematic.tsx",
    pattern: "cinematic film-still hero",
    description:
      "Agency cinematic hero with slow-reveal imagery, letterbox atmosphere, and dual CTAs.",
    defaultGoal: "Establish premium emotional presence",
  },
  HeroFullImage: {
    id: "HeroFullImage",
    exportName: "HeroFullImage",
    path: "components/sections/hero-full-image.tsx",
    pattern: "full image hero",
    description:
      "Image-led full-frame hero where photography carries the brand before copy.",
    defaultGoal: "Lead with imagery and appetite",
  },
  HeroInteractive: {
    id: "HeroInteractive",
    exportName: "HeroInteractive",
    path: "components/sections/hero-interactive.tsx",
    pattern: "interactive product hero",
    description:
      "Interactive hero with hotspot tabs, live preview frame, and conversion CTAs.",
    defaultGoal: "Let visitors explore product value",
  },
  HeroLuxury: {
    id: "HeroLuxury",
    exportName: "HeroLuxury",
    path: "components/sections/hero-luxury.tsx",
    pattern: "luxury editorial hero",
    description:
      "Premium luxury hero with refined typography, full-bleed atmosphere, and dual CTAs.",
    defaultGoal: "Establish world-class brand presence",
  },
  HeroLuxuryShowcase: {
    id: "HeroLuxuryShowcase",
    exportName: "HeroLuxuryShowcase",
    path: "components/sections/hero-luxury-showcase.tsx",
    pattern: "luxury vehicle hero",
    description: "Dark luxury hero with flagship vehicle, specs strip, and test-drive CTA.",
    defaultGoal: "Establish premium brand presence",
  },
  HeroVideo: {
    id: "HeroVideo",
    exportName: "HeroVideo",
    path: "components/sections/hero-video.tsx",
    pattern: "cinematic video hero",
    description:
      "Video-backed hero with poster image fallback, overlay copy, and primary CTA.",
    defaultGoal: "Create immersive first impression",
  },
  HeroSplit: {
    id: "HeroSplit",
    exportName: "HeroSplit",
    path: "components/sections/hero-split.tsx",
    pattern: "split content hero",
    description:
      "Split hero with copy/CTA column and large media column — ideal for product and corporate.",
    defaultGoal: "Balance message and visual proof",
  },
  HeroImage: {
    id: "HeroImage",
    exportName: "HeroImage",
    path: "components/sections/hero-image.tsx",
    pattern: "image-led hero",
    description:
      "Image-first hero with layered gradient, headline, and conversion CTAs.",
    defaultGoal: "Lead with a powerful brand image",
  },
  HeroProduct: {
    id: "HeroProduct",
    exportName: "HeroProduct",
    path: "components/sections/hero-product.tsx",
    pattern: "product SaaS hero",
    description: "Product-led hero with UI mock visual, value prop, and trial/demo CTAs.",
    defaultGoal: "Communicate product value in one viewport",
  },
  HeroProperty: {
    id: "HeroProperty",
    exportName: "HeroProperty",
    path: "components/sections/hero-property.tsx",
    pattern: "property search hero",
    description: "Property hero with search bar, featured listing imagery, and inquiry CTA.",
    defaultGoal: "Drive listing discovery",
  },
  DestinationsGallery: {
    id: "DestinationsGallery",
    exportName: "DestinationsGallery",
    path: "components/sections/destinations-gallery.tsx",
    pattern: "destination mosaic gallery",
    description: "Responsive destination cards with image, title, and explore link.",
    defaultGoal: "Showcase destination variety",
  },
  GalleryGrid: {
    id: "GalleryGrid",
    exportName: "GalleryGrid",
    path: "components/sections/gallery-grid.tsx",
    pattern: "premium gallery grid",
    description:
      "Responsive masonry-style gallery with captions and lightbox-ready cards.",
    defaultGoal: "Showcase visual proof of quality",
  },
  TourPackagesGrid: {
    id: "TourPackagesGrid",
    exportName: "TourPackagesGrid",
    path: "components/sections/tour-packages-grid.tsx",
    pattern: "tour package cards",
    description: "Tour/package cards with duration, highlights, price, and book CTA.",
    defaultGoal: "Convert interest into package selection",
  },
  BookingSection: {
    id: "BookingSection",
    exportName: "BookingSection",
    path: "components/sections/booking-section.tsx",
    pattern: "booking form panel",
    description: "Booking form with dates, travelers, package select, and submit CTA.",
    defaultGoal: "Capture booking intent",
  },
  BookingForm: {
    id: "BookingForm",
    exportName: "BookingForm",
    path: "components/sections/booking-form.tsx",
    pattern: "premium booking form",
    description:
      "Professional booking form with date/time fields, party size, and confirmation CTA.",
    defaultGoal: "Capture booking or appointment intent",
  },
  TestimonialsCarousel: {
    id: "TestimonialsCarousel",
    exportName: "TestimonialsCarousel",
    path: "components/sections/testimonials-carousel.tsx",
    pattern: "testimonial cards",
    description: "Traveler/customer testimonials with quote, name, and rating.",
    defaultGoal: "Build social proof",
  },
  TravelCtaBand: {
    id: "TravelCtaBand",
    exportName: "TravelCtaBand",
    path: "components/sections/travel-cta-band.tsx",
    pattern: "full-width travel CTA",
    description: "Wide CTA band with travel-focused headline and booking button.",
    defaultGoal: "Push final conversion to booking",
  },
  VehicleShowcase: {
    id: "VehicleShowcase",
    exportName: "VehicleShowcase",
    path: "components/sections/vehicle-showcase.tsx",
    pattern: "luxury vehicle showcase cards",
    description: "Featured models with imagery, trims, pricing, and view-details CTAs.",
    defaultGoal: "Highlight flagship vehicles",
  },
  VehicleDetail: {
    id: "VehicleDetail",
    exportName: "VehicleDetail",
    path: "components/sections/vehicle-detail.tsx",
    pattern: "vehicle detail page layout",
    description:
      "Model detail with gallery, specs grid, finance CTA, and test-drive booking.",
    defaultGoal: "Convert interest into appointments",
  },
  ProductShowcase: {
    id: "ProductShowcase",
    exportName: "ProductShowcase",
    path: "components/sections/product-showcase.tsx",
    pattern: "product showcase",
    description:
      "Featured product/service showcase with media, benefits, and shop/learn CTA.",
    defaultGoal: "Highlight flagship offer",
  },
  ServicesGrid: {
    id: "ServicesGrid",
    exportName: "ServicesGrid",
    path: "components/sections/services-grid.tsx",
    pattern: "service cards",
    description: "Service offerings grid with icons, short copy, and links.",
    defaultGoal: "Explain service value",
  },
  InventoryGrid: {
    id: "InventoryGrid",
    exportName: "InventoryGrid",
    path: "components/sections/inventory-grid.tsx",
    pattern: "filterable inventory grid",
    description: "Inventory cards with body/price filters and inquire CTA.",
    defaultGoal: "Browse available stock",
  },
  FinanceCalculator: {
    id: "FinanceCalculator",
    exportName: "FinanceCalculator",
    path: "components/sections/finance-calculator.tsx",
    pattern: "finance calculator",
    description: "Interactive payment estimator with price, down, term, and APR.",
    defaultGoal: "Clarify ownership cost",
  },
  AppointmentCalendar: {
    id: "AppointmentCalendar",
    exportName: "AppointmentCalendar",
    path: "components/sections/appointment-calendar.tsx",
    pattern: "appointment booking calendar",
    description: "Day/time calendar for test-drive and showroom appointments.",
    defaultGoal: "Book a test drive",
  },
  BranchesMap: {
    id: "BranchesMap",
    exportName: "BranchesMap",
    path: "components/sections/branches-map.tsx",
    pattern: "branch location section",
    description: "Branch cards with hours, phone, and map panel.",
    defaultGoal: "Help customers find a location",
  },
  VehicleComparison: {
    id: "VehicleComparison",
    exportName: "VehicleComparison",
    path: "components/sections/vehicle-comparison.tsx",
    pattern: "vehicle comparison table",
    description: "Side-by-side model comparison with specs and CTAs.",
    defaultGoal: "Help buyers choose a model",
  },
  TestimonialsSlider: {
    id: "TestimonialsSlider",
    exportName: "TestimonialsSlider",
    path: "components/sections/testimonials-slider.tsx",
    pattern: "premium testimonial slider",
    description: "Editorial testimonial slider with photography and controls.",
    defaultGoal: "Build trust with owner stories",
  },
  MapsSection: {
    id: "MapsSection",
    exportName: "MapsSection",
    path: "components/sections/maps-section.tsx",
    pattern: "map + locations",
    description:
      "Map embed panel with address, hours, and get-directions CTA for local businesses.",
    defaultGoal: "Help visitors find the business",
  },
  BookingCta: {
    id: "BookingCta",
    exportName: "BookingCta",
    path: "components/sections/booking-cta.tsx",
    pattern: "booking CTA band",
    description: "Conversion band for test-drive / appointment booking.",
    defaultGoal: "Drive booking conversions",
  },
  PropertyListings: {
    id: "PropertyListings",
    exportName: "PropertyListings",
    path: "components/sections/property-listings.tsx",
    pattern: "property listing cards",
    description: "Featured listings with photo, price, beds/baths, and view CTA.",
    defaultGoal: "Surface best properties",
  },
  FeatureHighlights: {
    id: "FeatureHighlights",
    exportName: "FeatureHighlights",
    path: "components/sections/feature-highlights.tsx",
    pattern: "feature highlight rows",
    description: "Alternating feature rows with imagery and benefit copy.",
    defaultGoal: "Communicate differentiators",
  },
  LocationSections: {
    id: "LocationSections",
    exportName: "LocationSections",
    path: "components/sections/location-sections.tsx",
    pattern: "neighborhood / location blocks",
    description: "Location or neighborhood blocks with map cue and highlights.",
    defaultGoal: "Sell location value",
  },
  ContactCta: {
    id: "ContactCta",
    exportName: "ContactCta",
    path: "components/sections/contact-cta.tsx",
    pattern: "contact CTA + form",
    description: "Contact section with form fields and primary submit CTA.",
    defaultGoal: "Capture leads",
  },
  ContactSection: {
    id: "ContactSection",
    exportName: "ContactSection",
    path: "components/sections/contact-section.tsx",
    pattern: "split contact section",
    description:
      "Split contact layout with form, details, and trust cues for professional lead capture.",
    defaultGoal: "Capture qualified leads",
  },
  FeaturesBento: {
    id: "FeaturesBento",
    exportName: "FeaturesBento",
    path: "components/sections/features-bento.tsx",
    pattern: "bento feature grid",
    description: "Bento-style product feature grid with icons and short benefits.",
    defaultGoal: "Show product capabilities",
  },
  PricingTable: {
    id: "PricingTable",
    exportName: "PricingTable",
    path: "components/sections/pricing-table.tsx",
    pattern: "pricing tiers",
    description: "Pricing cards with plan features and subscribe/demo CTAs.",
    defaultGoal: "Clarify plans and convert",
  },
  IntegrationsLogoCloud: {
    id: "IntegrationsLogoCloud",
    exportName: "IntegrationsLogoCloud",
    path: "components/sections/integrations-logo-cloud.tsx",
    pattern: "logo cloud",
    description: "Integrations / partner logo cloud with short supporting line.",
    defaultGoal: "Show ecosystem trust",
  },
  FaqAccordion: {
    id: "FaqAccordion",
    exportName: "FaqAccordion",
    path: "components/sections/faq-accordion.tsx",
    pattern: "FAQ accordion",
    description: "Accessible FAQ accordion with concise answers.",
    defaultGoal: "Handle objections",
  },
  SocialProof: {
    id: "SocialProof",
    exportName: "SocialProof",
    path: "components/sections/social-proof.tsx",
    pattern: "logo wall / metrics",
    description: "Social proof strip with logos or key metrics.",
    defaultGoal: "Increase credibility",
  },
  CtaBand: {
    id: "CtaBand",
    exportName: "CtaBand",
    path: "components/sections/cta-band.tsx",
    pattern: "generic CTA band",
    description: "Reusable full-width CTA section.",
    defaultGoal: "Drive next action",
  },
  CtaSplit: {
    id: "CtaSplit",
    exportName: "CtaSplit",
    path: "components/sections/cta-split.tsx",
    pattern: "split CTA panel",
    description:
      "Split CTA with headline/copy on one side and action card on the other.",
    defaultGoal: "Drive a decisive conversion action",
  },
  FeaturesModern: {
    id: "FeaturesModern",
    exportName: "FeaturesModern",
    path: "components/sections/features-modern.tsx",
    pattern: "modern feature grid",
    description:
      "Modern feature grid with icons, short benefits, and responsive 2/3 columns.",
    defaultGoal: "Communicate product/service differentiators",
  },
  ServicesModern: {
    id: "ServicesModern",
    exportName: "ServicesModern",
    path: "components/sections/services-modern.tsx",
    pattern: "modern services rows",
    description:
      "Elevated service cards with media accents and clear learn-more links.",
    defaultGoal: "Present services with premium clarity",
  },
  TestimonialsModern: {
    id: "TestimonialsModern",
    exportName: "TestimonialsModern",
    path: "components/sections/testimonials-modern.tsx",
    pattern: "featured testimonial + grid",
    description:
      "Featured quote with supporting testimonial cards for high-trust proof.",
    defaultGoal: "Build credibility with layered social proof",
  },
  PricingModern: {
    id: "PricingModern",
    exportName: "PricingModern",
    path: "components/sections/pricing-modern.tsx",
    pattern: "highlighted pricing tiers",
    description:
      "Pricing table with featured plan, feature lists, and mobile-stacked cards.",
    defaultGoal: "Clarify plans and convert buyers",
  },
  PortfolioGallery: {
    id: "PortfolioGallery",
    exportName: "PortfolioGallery",
    path: "components/sections/portfolio-gallery.tsx",
    pattern: "portfolio masonry gallery",
    description:
      "Portfolio/gallery mosaic with hover reveals and category labels.",
    defaultGoal: "Showcase craft and visual proof",
  },
  MenuHighlights: {
    id: "MenuHighlights",
    exportName: "MenuHighlights",
    path: "components/sections/menu-highlights.tsx",
    pattern: "menu highlight cards",
    description: "Signature dishes / menu highlights with imagery.",
    defaultGoal: "Showcase culinary offer",
  },
  ReservationSection: {
    id: "ReservationSection",
    exportName: "ReservationSection",
    path: "components/sections/reservation-section.tsx",
    pattern: "reservation form",
    description: "Table reservation form with date/time/party size.",
    defaultGoal: "Book a table",
  },
  CareServices: {
    id: "CareServices",
    exportName: "CareServices",
    path: "components/sections/care-services.tsx",
    pattern: "care services grid",
    description: "Healthcare services cards with calm trust-focused layout.",
    defaultGoal: "Explain care offerings",
  },
  DoctorProfiles: {
    id: "DoctorProfiles",
    exportName: "DoctorProfiles",
    path: "components/sections/doctor-profiles.tsx",
    pattern: "clinician profiles",
    description: "Doctor/clinician profile cards with specialty and book CTA.",
    defaultGoal: "Build clinician trust",
  },
  ProgramsGrid: {
    id: "ProgramsGrid",
    exportName: "ProgramsGrid",
    path: "components/sections/programs-grid.tsx",
    pattern: "education programs grid",
    description: "Program/course cards with outcomes and apply CTA.",
    defaultGoal: "Promote programs",
  },
  AdmissionsCta: {
    id: "AdmissionsCta",
    exportName: "AdmissionsCta",
    path: "components/sections/admissions-cta.tsx",
    pattern: "admissions CTA",
    description: "Admissions conversion section with apply/tour CTAs.",
    defaultGoal: "Drive enrollment",
  },
  ProductGrid: {
    id: "ProductGrid",
    exportName: "ProductGrid",
    path: "components/sections/product-grid.tsx",
    pattern: "product commerce grid",
    description: "Product cards with image, price, and shop CTA.",
    defaultGoal: "Drive product discovery",
  },
  CollectionsGrid: {
    id: "CollectionsGrid",
    exportName: "CollectionsGrid",
    path: "components/sections/collections-grid.tsx",
    pattern: "collections grid",
    description: "Collection tiles for category browsing.",
    defaultGoal: "Organize catalog browsing",
  },
  PortfolioGrid: {
    id: "PortfolioGrid",
    exportName: "PortfolioGrid",
    path: "components/sections/portfolio-grid.tsx",
    pattern: "portfolio case grid",
    description: "Selected work / case study cards.",
    defaultGoal: "Prove agency craft",
  },
  ProcessSteps: {
    id: "ProcessSteps",
    exportName: "ProcessSteps",
    path: "components/sections/process-steps.tsx",
    pattern: "numbered process",
    description: "Step-by-step process section.",
    defaultGoal: "Explain how engagement works",
  },
  TeamSection: {
    id: "TeamSection",
    exportName: "TeamSection",
    path: "components/sections/team-section.tsx",
    pattern: "team profiles grid",
    description:
      "Professional team grid with photos, roles, and short bios.",
    defaultGoal: "Build human trust and expertise",
  },
  BlogSection: {
    id: "BlogSection",
    exportName: "BlogSection",
    path: "components/sections/blog-section.tsx",
    pattern: "blog / insights cards",
    description:
      "Latest articles or insights cards with image, category, and read-more link.",
    defaultGoal: "Demonstrate thought leadership",
  },
  ProductInteractive: {
    id: "ProductInteractive",
    exportName: "ProductInteractive",
    path: "components/sections/product-interactive.tsx",
    pattern: "interactive product showcase",
    description:
      "Guided product showcase with selectable panels and a large stage visual.",
    defaultGoal: "Demonstrate product depth without card grids",
  },
  FeatureStorytelling: {
    id: "FeatureStorytelling",
    exportName: "FeatureStorytelling",
    path: "components/sections/feature-storytelling.tsx",
    pattern: "feature storytelling bands",
    description:
      "Alternating editorial story chapters for features — narrative, not cards.",
    defaultGoal: "Tell the product story with premium rhythm",
  },
  CaseStudies: {
    id: "CaseStudies",
    exportName: "CaseStudies",
    path: "components/sections/case-studies.tsx",
    pattern: "editorial case studies",
    description:
      "Long-form case study rows with outcomes, imagery, and engagement links.",
    defaultGoal: "Prove results with editorial weight",
  },
  BrandTrust: {
    id: "BrandTrust",
    exportName: "BrandTrust",
    path: "components/sections/brand-trust.tsx",
    pattern: "brand trust strip",
    description:
      "Logo rhythm, metrics, and featured endorsement — trust without card clutter.",
    defaultGoal: "Build credibility through composition",
  },
  TimelineSection: {
    id: "TimelineSection",
    exportName: "TimelineSection",
    path: "components/sections/timeline-section.tsx",
    pattern: "vertical timeline",
    description: "Vertical process timeline with clear phases and narrative pacing.",
    defaultGoal: "Explain the journey from brief to launch",
  },
  ComparisonSection: {
    id: "ComparisonSection",
    exportName: "ComparisonSection",
    path: "components/sections/comparison-section.tsx",
    pattern: "comparison table",
    description: "Clean comparison table highlighting differentiation vs alternatives.",
    defaultGoal: "Clarify why this brand wins",
  },
  VideoSection: {
    id: "VideoSection",
    exportName: "VideoSection",
    path: "components/sections/video-section.tsx",
    pattern: "cinematic video frame",
    description: "Poster-led cinematic video section with play affordance.",
    defaultGoal: "Deliver motion storytelling",
  },
  GalleryExperience: {
    id: "GalleryExperience",
    exportName: "GalleryExperience",
    path: "components/sections/gallery-experience.tsx",
    pattern: "asymmetric gallery mosaic",
    description:
      "Asymmetric gallery experience with intentional scale hierarchy.",
    defaultGoal: "Immerse visitors in brand atmosphere",
  },
};

export function getRendererComponent(
  id: DesignRendererComponentId,
): DesignRendererComponentSpec {
  return DESIGN_RENDERER_COMPONENTS[id];
}

export function componentPathFor(
  id: DesignRendererComponentId,
): string {
  return DESIGN_RENDERER_COMPONENTS[id].path;
}
