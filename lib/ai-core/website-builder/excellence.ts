/**
 * Website Builder Excellence Program — output-quality helpers.
 * Improves layout diversity, section intelligence, and design-system wiring
 * without adding new intelligence engines.
 */

import type { SectionShellVariant } from "@/lib/ai-core/components/scaffolds";
import type { DesignSystemSpec } from "@/lib/ai-core/design-intelligence/die-types";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import type { CoreStrategyPage } from "@/lib/ai-core/layers/types";

export type CompositionMode =
  | "editorial"
  | "story"
  | "product"
  | "trust"
  | "balanced";

export type InnerPageSectionContext = {
  industryId?: IndustryId | string;
  compositionMode?: CompositionMode;
  heroTreatment?: string;
  pagePurpose?: string;
};

/** Map DesignSystemSpec → section shell variant for inject/polish. */
export function resolveSectionShellVariantFromSpec(
  spec?: DesignSystemSpec | null,
): SectionShellVariant {
  if (!spec) return "default";

  const mode = spec.layoutComposition.compositionMode as CompositionMode;
  const sectionLayout = spec.layoutComposition.sectionLayout.toLowerCase();
  const cardStyle = spec.layoutComposition.cardStyle.toLowerCase();
  const density = spec.spacing.density;

  if (/bento/.test(sectionLayout) || /bento/.test(cardStyle)) return "bento";
  if (mode === "editorial" || /editorial|magazine|asymmetric/.test(sectionLayout)) {
    return "editorial";
  }
  if (mode === "story" || /story|narrative|cinematic/.test(sectionLayout)) {
    return "magazine";
  }
  if (
    /elevated|card-first|commerce|grid/.test(cardStyle) ||
    mode === "product"
  ) {
    return "card-first";
  }
  if (density === "compact" || /minimal|clean/.test(cardStyle)) return "minimal";
  return "default";
}

function normalizePageBlob(page: CoreStrategyPage): string {
  return [page.name, page.purpose, ...(page.keySections ?? [])]
    .join(" ")
    .toLowerCase();
}

export function resolveComponentIdForStrategySection(
  sectionName: string,
  ctx: InnerPageSectionContext = {},
): DesignRendererComponentId {
  const lower = sectionName.trim().toLowerCase();
  if (/\bhero\b/.test(lower)) {
    const industry = String(ctx.industryId || "").toLowerCase();
    if (industry === "restaurant") return "HeroFullBleed";
    if (industry === "real-estate" || industry === "real_estate") {
      return "HeroProperty";
    }
    if (industry === "tourism") return "HeroFullBleed";
    if (industry === "saas") return "HeroProduct";
    if (industry === "automotive") return "HeroLuxuryShowcase";
    return "HeroSplit";
  }
  return componentForKeySection(sectionName, ctx);
}

function componentForKeySection(
  key: string,
  ctx: InnerPageSectionContext,
): DesignRendererComponentId {
  const lower = key.toLowerCase();
  const industry = String(ctx.industryId || "").toLowerCase();

  if (/featured\s*models?|model\s*lineup|vehicle\s*lineup/.test(lower)) {
    return industry === "automotive" ? "InventoryGrid" : "ProductShowcase";
  }
  if (/trust\s*bar|trustbar/.test(lower)) return "BrandTrust";
  if (/why\s*choose|whychoose/.test(lower)) return "FeatureStorytelling";
  if (/test\s*drive|testdrive/.test(lower)) return "CtaBand";
  if (/contact|inquiry|reach|get in touch/.test(lower)) return "ContactSection";
  if (/testimonial|review|proof|social/.test(lower)) return "TestimonialsCarousel";
  if (/faq|question/.test(lower)) return "FaqAccordion";
  if (/cta|book|schedule|demo|get started/.test(lower)) return "CtaBand";
  if (/map|location|branch|find us|address|neighborhood/.test(lower)) {
    return industry === "real-estate" ? "LocationSections" : "MapsSection";
  }
  if (/list|propert/.test(lower) && industry === "real-estate") {
    return "PropertyListings";
  }
  if (/book|reserv|appoint/.test(lower)) return "BookingForm";
  if (/pric|plan|tier|package/.test(lower)) return "PricingTable";
  if (/team|doctor|staff|expert|people|leadership/.test(lower)) {
    return "TeamSection";
  }
  if (/process|timeline|journey|how we/.test(lower)) return "ProcessSteps";
  if (/case stud|portfolio|work|project/.test(lower)) return "CaseStudies";
  if (/gallery|showcase|visual|atmosphere/.test(lower)) {
    return industry === "tourism" ? "DestinationsGallery" : "GalleryExperience";
  }
  if (/service|care|offer|capabilit/.test(lower)) return "ServicesGrid";
  if (/feature|why|benefit|highlight/.test(lower)) return "FeatureStorytelling";
  if (/trust|credibility|logo|partner/.test(lower)) return "BrandTrust";
  if (/video|film/.test(lower)) return "VideoSection";
  if (/compare|versus|\bvs\b/.test(lower)) return "ComparisonSection";
  if (/inventory|vehicle|product|collection|menu/.test(lower)) {
    if (industry === "automotive") return "InventoryGrid";
    if (industry === "restaurant") return "MenuHighlights";
    if (industry === "ecommerce") return "ProductGrid";
    return "ProductShowcase";
  }

  if (ctx.compositionMode === "editorial") return "FeatureStorytelling";
  if (ctx.compositionMode === "story") return "TimelineSection";
  if (ctx.compositionMode === "product") return "ServicesGrid";
  if (ctx.compositionMode === "trust") return "BrandTrust";
  return "FeatureHighlights";
}

/** Industry-aware default sections when a page has no explicit key sections. */
export function resolveDefaultInnerPageSections(
  page: CoreStrategyPage,
  ctx: InnerPageSectionContext,
): Array<{ name: string; componentId: DesignRendererComponentId }> {
  const blob = normalizePageBlob(page);
  const industry = String(ctx.industryId || "").toLowerCase();

  if (/about|story|who we|our team|mission|values/.test(blob)) {
    return [
      { name: "Our story", componentId: "FeatureStorytelling" },
      { name: "Team", componentId: "TeamSection" },
      { name: "Trust", componentId: "BrandTrust" },
      { name: "Contact", componentId: "ContactCta" },
    ];
  }
  if (/service|solution|what we do|offerings|capabilities/.test(blob)) {
    return [
      { name: "Services overview", componentId: "ServicesGrid" },
      { name: "Process", componentId: "ProcessSteps" },
      { name: "Proof", componentId: "TestimonialsCarousel" },
      { name: "Get started", componentId: "CtaBand" },
    ];
  }
  if (/project|portfolio|work|case|gallery/.test(blob)) {
    return [
      { name: "Selected work", componentId: "CaseStudies" },
      { name: "Gallery", componentId: "GalleryExperience" },
      { name: "Results", componentId: "SocialProof" },
      { name: "Start a project", componentId: "CtaSplit" },
    ];
  }
  if (/contact|inquiry|book|schedule|appointment/.test(blob)) {
    return [
      { name: "Contact", componentId: "ContactSection" },
      { name: "Locations", componentId: "MapsSection" },
      { name: "FAQ", componentId: "FaqAccordion" },
    ];
  }
  if (/pricing|plans|packages/.test(blob)) {
    return [
      { name: "Plans", componentId: "PricingTable" },
      { name: "Compare", componentId: "ComparisonSection" },
      { name: "FAQ", componentId: "FaqAccordion" },
      { name: "Get started", componentId: "CtaBand" },
    ];
  }

  if (industry === "automotive" && /model|inventory|vehicle/.test(blob)) {
    return [
      { name: "Showcase", componentId: "VehicleShowcase" },
      { name: "Compare", componentId: "VehicleComparison" },
      { name: "Finance", componentId: "FinanceCalculator" },
    ];
  }
  if (industry === "real-estate" && /list|propert/.test(blob)) {
    return [
      { name: "Listings", componentId: "PropertyListings" },
      { name: "Neighborhoods", componentId: "LocationSections" },
      { name: "Inquiry", componentId: "ContactCta" },
    ];
  }
  if (industry === "tourism" && /tour|destin|travel/.test(blob)) {
    return [
      { name: "Destinations", componentId: "DestinationsGallery" },
      { name: "Packages", componentId: "TourPackagesGrid" },
      { name: "Book", componentId: "BookingSection" },
    ];
  }

  return [
    { name: page.purpose || page.name, componentId: "FeatureStorytelling" },
    { name: "Proof", componentId: "TestimonialsCarousel" },
    { name: "Next step", componentId: "ContactCta" },
  ];
}

/** Map page + key sections → concrete renderer sections (replaces generic FeatureHighlights default). */
export function resolveInnerPageSections(
  page: CoreStrategyPage,
  websiteSections: string[] | undefined,
  ctx: InnerPageSectionContext,
): Array<{ name: string; componentId: DesignRendererComponentId }> {
  const keys =
    page.keySections?.length > 0
      ? page.keySections
      : (websiteSections ?? []).slice(0, 3);

  if (!keys.length) {
    return resolveDefaultInnerPageSections(page, ctx);
  }

  return keys.slice(0, 4).map((key) => ({
    name: key,
    componentId: componentForKeySection(key, ctx),
  }));
}

/** Spacing CSS tokens tuned to design-system density. */
export function buildExcellenceSpacingCss(
  density: "airy" | "balanced" | "compact" = "balanced",
): string {
  const sectionY =
    density === "airy" ? "8.5rem" : density === "compact" ? "5.5rem" : "7.5rem";
  const sectionYMobile =
    density === "airy" ? "5rem" : density === "compact" ? "3.5rem" : "4.25rem";
  const gap =
    density === "airy" ? "2.25rem" : density === "compact" ? "1.25rem" : "1.75rem";

  return `
/* Excellence Program — density-aware rhythm */
:root {
  --section-y: ${sectionY};
  --section-y-mobile: ${sectionYMobile};
  --space-section-gap: ${gap};
}
`;
}
