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
  | "NavSidebar"
  | "NavHamburger"
  | "NavCentered"
  | "SiteFooter"
  | "SiteFooterMinimal"
  | "SiteFooterEditorial"
  | "FloatingCta"
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
  | "GalleryExperience"
  | "ThemeLuxuryNav"
  | "ThemeLuxuryHero"
  | "ThemeLuxuryStory"
  | "ThemeLuxuryGallery"
  | "ThemeLuxuryTestimonials"
  | "ThemeLuxuryCta"
  | "ThemeLuxuryFooter"
  | "ThemeModernNav"
  | "ThemeModernHero"
  | "ThemeModernFeatures"
  | "ThemeModernServices"
  | "ThemeModernPricing"
  | "ThemeModernFaq"
  | "ThemeModernFooter"
  | "ThemeMinimalNav"
  | "ThemeMinimalHero"
  | "ThemeMinimalHighlights"
  | "ThemeMinimalServices"
  | "ThemeMinimalTestimonials"
  | "ThemeMinimalContact"
  | "ThemeMinimalFooter"
  | "ThemeCorporateNav"
  | "ThemeCorporateHero"
  | "ThemeCorporateProcess"
  | "ThemeCorporateServices"
  | "ThemeCorporateTrust"
  | "ThemeCorporateTestimonials"
  | "ThemeCorporateContact"
  | "ThemeCorporateFooter"
  | "ThemeCreativeNav"
  | "ThemeCreativeHero"
  | "ThemeCreativeGallery"
  | "ThemeCreativeCases"
  | "ThemeCreativeStory"
  | "ThemeCreativeCta"
  | "ThemeCreativeFooter"
  | "ThemeTechNav"
  | "ThemeTechHero"
  | "ThemeTechBento"
  | "ThemeTechCases"
  | "ThemeTechIntegrations"
  | "ThemeTechTrust"
  | "ThemeTechCta"
  | "ThemeTechFooter"
  | "ThemeTechFloatingCta"
  | "ThemeEditorialNav"
  | "ThemeEditorialHero"
  | "ThemeEditorialMagazine"
  | "ThemeEditorialStory"
  | "ThemeEditorialTimeline"
  | "ThemeEditorialGallery"
  | "ThemeEditorialFooter"
  | "ThemeBoldNav"
  | "ThemeBoldHero"
  | "ThemeBoldPortfolio"
  | "ThemeBoldFeatures"
  | "ThemeBoldPricing"
  | "ThemeBoldIntegrations"
  | "ThemeBoldFaq"
  | "ThemeBoldFooter"
  | "ThemeBoldFloatingCta"
  | "ThemeGlobalNav"
  | "ThemeGlobalHero"
  | "ThemeGlobalShowcase"
  | "ThemeGlobalIntegrations"
  | "ThemeGlobalFeatures"
  | "ThemeGlobalFaq"
  | "ThemeGlobalPricing"
  | "ThemeGlobalTestimonials"
  | "ThemeGlobalContact"
  | "ThemeGlobalFooter"
  | "ThemeGlobalFloatingCta";

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
  /** Ordered home-page component ids (header → sections → footer) when DNA-driven. */
  homeComponentOrder?: DesignRendererComponentId[];
  /** Component paths the file planner should prefer. */
  componentPaths: string[];
  layoutRules: string[];
  source: "preset" | "merged" | "professional-library";
  /** Section shell variant for inject/polish (from DesignSystemSpec). */
  sectionShellVariant?: import("@/lib/ai-core/components/scaffolds").SectionShellVariant;
  compositionMode?: "editorial" | "story" | "product" | "trust" | "balanced";
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
  /** Website output language for localized section naming. */
  language?: string | null;
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
  /** Explicit Template DNA component order (nav → sections → footer). */
  premiumComponentOrder?: DesignRendererComponentId[];
  premiumRecommendedComponents?: DesignRendererComponentId[];
  /** Layout composition mode from Design Intelligence (EDS-004). */
  compositionMode?: "editorial" | "story" | "product" | "trust" | "balanced";
  /** Authoritative design system spec for component/shell styling. */
  designSystemSpec?: import("@/lib/ai-core/design-intelligence/die-types").DesignSystemSpec | null;
};

export type DesignRendererResult = {
  plan: DesignRenderPlan;
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
};
