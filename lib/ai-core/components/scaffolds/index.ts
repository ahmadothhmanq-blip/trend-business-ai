import { ADVANCED_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/advanced";
import { AUTOMOTIVE_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/automotive";
import { HERO_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/heroes";
import { NAV_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/nav";
import { PREMIUM_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/premium";
import { SECTION_SCAFFOLDS } from "@/lib/ai-core/components/scaffolds/sections";
import {
  MOTION_PATH,
  MOTION_SOURCE,
  SECTION_SHELL_PATH,
  SECTION_SHELL_SOURCE,
} from "@/lib/ai-core/components/scaffolds/shared";
import { DESIGN_RENDERER_COMPONENTS } from "@/lib/ai-core/design-renderer/components";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";

function renameExport(source: string, exportName: string): string {
  return source.replace(/export function \w+/, `export function ${exportName}`);
}

const BY_ID: Record<string, string> = {
  ...SECTION_SCAFFOLDS,
  ...HERO_SCAFFOLDS,
  ...NAV_SCAFFOLDS,
  ...ADVANCED_SCAFFOLDS,
  ...PREMIUM_SCAFFOLDS,
  ...AUTOMOTIVE_SCAFFOLDS,
  // Prefer advanced quality variants for core section kinds.
  FeatureHighlights: renameExport(
    ADVANCED_SCAFFOLDS.FeaturesModern,
    "FeatureHighlights",
  ),
  FeaturesBento: renameExport(ADVANCED_SCAFFOLDS.FeaturesModern, "FeaturesBento"),
  ServicesGrid: renameExport(ADVANCED_SCAFFOLDS.ServicesModern, "ServicesGrid"),
  TestimonialsCarousel: renameExport(
    AUTOMOTIVE_SCAFFOLDS.TestimonialsSlider,
    "TestimonialsCarousel",
  ),
  PricingTable: renameExport(ADVANCED_SCAFFOLDS.PricingModern, "PricingTable"),
  GalleryGrid: renameExport(ADVANCED_SCAFFOLDS.PortfolioGallery, "GalleryGrid"),
  CtaBand: renameExport(ADVANCED_SCAFFOLDS.CtaSplit, "CtaBand"),
  // Automotive-dedicated scaffolds win over generic aliases.
  VehicleShowcase: AUTOMOTIVE_SCAFFOLDS.VehicleShowcase,
  VehicleDetail: AUTOMOTIVE_SCAFFOLDS.VehicleDetail,
  InventoryGrid: AUTOMOTIVE_SCAFFOLDS.InventoryGrid,
  FinanceCalculator: AUTOMOTIVE_SCAFFOLDS.FinanceCalculator,
  AppointmentCalendar: AUTOMOTIVE_SCAFFOLDS.AppointmentCalendar,
  BranchesMap: AUTOMOTIVE_SCAFFOLDS.BranchesMap,
  VehicleComparison: AUTOMOTIVE_SCAFFOLDS.VehicleComparison,
  TestimonialsSlider: AUTOMOTIVE_SCAFFOLDS.TestimonialsSlider,
};

/** Alias industry-specific components onto professional scaffolds when needed. */
const ALIASES: Partial<Record<DesignRendererComponentId, string>> = {
  HeroLuxuryShowcase: HERO_SCAFFOLDS.HeroLuxury,
  HeroProperty: HERO_SCAFFOLDS.HeroSplit,
  DestinationsGallery: PREMIUM_SCAFFOLDS.GalleryExperience,
  TourPackagesGrid: PREMIUM_SCAFFOLDS.ProductInteractive,
  ProductGrid: PREMIUM_SCAFFOLDS.ProductInteractive,
  CollectionsGrid: PREMIUM_SCAFFOLDS.GalleryExperience,
  PortfolioGrid: PREMIUM_SCAFFOLDS.CaseStudies,
  MenuHighlights: PREMIUM_SCAFFOLDS.GalleryExperience,
  ReservationSection: SECTION_SCAFFOLDS.BookingForm,
  CareServices: ADVANCED_SCAFFOLDS.ServicesModern || SECTION_SCAFFOLDS.ServicesGrid,
  DoctorProfiles: SECTION_SCAFFOLDS.TeamSection,
  ProgramsGrid: ADVANCED_SCAFFOLDS.ServicesModern || SECTION_SCAFFOLDS.ServicesGrid,
  PropertyListings: PREMIUM_SCAFFOLDS.ProductInteractive,
  ProcessSteps: PREMIUM_SCAFFOLDS.TimelineSection,
  SocialProof: PREMIUM_SCAFFOLDS.BrandTrust,
  IntegrationsLogoCloud: PREMIUM_SCAFFOLDS.BrandTrust,
  TravelCtaBand: ADVANCED_SCAFFOLDS.CtaSplit || SECTION_SCAFFOLDS.CtaBand,
  BookingCta: SECTION_SCAFFOLDS.CtaBand,
  AdmissionsCta: ADVANCED_SCAFFOLDS.CtaSplit,
  LocationSections: AUTOMOTIVE_SCAFFOLDS.BranchesMap,
  FeatureHighlights: PREMIUM_SCAFFOLDS.FeatureStorytelling,
  FeaturesBento: PREMIUM_SCAFFOLDS.FeatureStorytelling,
  ServicesGrid: ADVANCED_SCAFFOLDS.ServicesModern,
  PricingTable: ADVANCED_SCAFFOLDS.PricingModern,
  GalleryGrid: PREMIUM_SCAFFOLDS.GalleryExperience,
  CtaBand: ADVANCED_SCAFFOLDS.CtaSplit,
};

export function getProfessionalScaffoldById(id: string): string | null {
  if (BY_ID[id]) return BY_ID[id]!;
  const aliased = ALIASES[id as DesignRendererComponentId];
  if (aliased) {
    return aliased.replace(/export function \w+/, `export function ${id}`);
  }
  return null;
}

export function getProfessionalScaffoldByPath(path: string): string | null {
  if (path === SECTION_SHELL_PATH) return SECTION_SHELL_SOURCE;
  if (path === MOTION_PATH) return MOTION_SOURCE;
  for (const [id, spec] of Object.entries(DESIGN_RENDERER_COMPONENTS)) {
    if (spec.path === path) {
      return getProfessionalScaffoldById(id);
    }
  }
  return null;
}

export function listProfessionalScaffoldPaths(componentIds: string[]): string[] {
  const paths = new Set<string>([SECTION_SHELL_PATH, MOTION_PATH]);
  for (const id of componentIds) {
    const spec = DESIGN_RENDERER_COMPONENTS[id as DesignRendererComponentId];
    if (spec?.path) paths.add(spec.path);
  }
  return Array.from(paths);
}

export { SECTION_SHELL_PATH, SECTION_SHELL_SOURCE, MOTION_PATH, MOTION_SOURCE };
