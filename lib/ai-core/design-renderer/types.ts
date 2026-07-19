import type { IndustryId } from "@/lib/ai-core/templates/types";
import type {
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

/** Concrete UI components the renderer selects for generation. */
export type DesignRendererComponentId =
  | "SiteHeader"
  | "SiteHeaderTransparent"
  | "NavModern"
  | "SiteFooter"
  | "HeroFullBleed"
  | "HeroCinematic"
  | "HeroFullImage"
  | "HeroInteractive"
  | "HeroLuxury"
  | "HeroLuxuryShowcase"
  | "HeroVideo"
  | "HeroSplit"
  | "HeroImage"
  | "HeroProduct"
  | "HeroProperty"
  | "DestinationsGallery"
  | "GalleryGrid"
  | "TourPackagesGrid"
  | "BookingSection"
  | "BookingForm"
  | "TestimonialsCarousel"
  | "TravelCtaBand"
  | "VehicleShowcase"
  | "VehicleDetail"
  | "ProductShowcase"
  | "ServicesGrid"
  | "InventoryGrid"
  | "FinanceCalculator"
  | "AppointmentCalendar"
  | "BranchesMap"
  | "VehicleComparison"
  | "TestimonialsSlider"
  | "MapsSection"
  | "BookingCta"
  | "PropertyListings"
  | "FeatureHighlights"
  | "LocationSections"
  | "ContactCta"
  | "ContactSection"
  | "FeaturesBento"
  | "PricingTable"
  | "IntegrationsLogoCloud"
  | "FaqAccordion"
  | "SocialProof"
  | "CtaBand"
  | "CtaSplit"
  | "FeaturesModern"
  | "ServicesModern"
  | "TestimonialsModern"
  | "PricingModern"
  | "PortfolioGallery"
  | "MenuHighlights"
  | "ReservationSection"
  | "CareServices"
  | "DoctorProfiles"
  | "ProgramsGrid"
  | "AdmissionsCta"
  | "ProductGrid"
  | "CollectionsGrid"
  | "PortfolioGrid"
  | "ProcessSteps"
  | "TeamSection"
  | "BlogSection"
  | "ProductInteractive"
  | "FeatureStorytelling"
  | "CaseStudies"
  | "BrandTrust"
  | "TimelineSection"
  | "ComparisonSection"
  | "VideoSection"
  | "GalleryExperience";

export type DesignRendererSection = {
  id: string;
  page: string;
  /** Human label (section title). */
  name: string;
  /** Concrete component to implement under components/. */
  componentId: DesignRendererComponentId;
  /** Suggested file path relative to project root. */
  componentPath: string;
  pattern: string;
  goal: string;
  contentNotes: string;
  /** Preferred asset role when Asset Generator plans images. */
  assetRole?:
    | "hero"
    | "product"
    | "service"
    | "section"
    | "background"
    | "gallery"
    | "testimonial";
  sortOrder: number;
};

export type DesignRendererVisualStyle = {
  layoutStyle: string;
  density: "airy" | "balanced" | "compact";
  heroTreatment: string;
  cardTreatment: string;
  ctaTreatment: string;
  motionNotes: string;
  uiPatterns: string[];
};

export type DesignRenderPlan = {
  industryId: IndustryId;
  industryLabel: string;
  layoutStyle: string;
  visualStyle: DesignRendererVisualStyle;
  /** Ordered home-page-first section tree. */
  sections: DesignRendererSection[];
  /** Deduped concrete component ids for DesignSystem.componentPalette. */
  componentPalette: DesignRendererComponentId[];
  /** Component paths the file planner should prefer. */
  componentPaths: string[];
  layoutRules: string[];
  source: "preset" | "merged" | "professional-library";
};

export type DesignRendererInput = {
  industryId?: IndustryId | string;
  industryLabel?: string;
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  /** Optional section labels from industry / template. */
  websiteSections?: string[];
  designStyle?: string;
  ctaTypes?: string[];
  /** Professional Components Library selection signals. */
  businessType?: string;
  targetAudience?: string;
  stylePreset?: string;
  premiumHeroStyle?: string;
  premiumSectionLayout?: string;
  /** Lead-gen / booking / ecommerce / brand / content / conversion */
  websiteGoal?: string;
  businessGoals?: string[];
  positioning?: string;
  brandName?: string;
  /** Premium Templates System home plan (authoritative when present). */
  premiumHomeSections?: Array<{
    name: string;
    componentId: DesignRendererComponentId;
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
  }>;
  premiumRecommendedComponents?: DesignRendererComponentId[];
};

export type DesignRendererResult = {
  plan: DesignRenderPlan;
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
};
