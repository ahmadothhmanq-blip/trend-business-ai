import { DESIGN_RENDERER_COMPONENTS } from "@/lib/ai-core/design-renderer/components";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";

function isComponentId(id: string): id is DesignRendererComponentId {
  return id in DESIGN_RENDERER_COMPONENTS;
}

const HERO_IDS = new Set<string>([
  "HeroFullBleed",
  "HeroCinematic",
  "HeroFullImage",
  "HeroInteractive",
  "HeroLuxury",
  "HeroLuxuryShowcase",
  "HeroVideo",
  "HeroSplit",
  "HeroImage",
  "HeroProduct",
  "HeroProperty",
]);

const HEADER_IDS = new Set([
  "SiteHeaderTransparent",
  "NavModern",
  "SiteHeader",
]);

const SERVICES_IDS = new Set([
  "ServicesGrid",
  "ServicesModern",
  "CareServices",
  "ProgramsGrid",
  "TourPackagesGrid",
]);

const FEATURES_IDS = new Set([
  "FeatureHighlights",
  "FeaturesBento",
  "FeaturesModern",
  "FeatureStorytelling",
]);

const TESTIMONIAL_IDS = new Set([
  "TestimonialsCarousel",
  "TestimonialsModern",
  "TestimonialsSlider",
  "SocialProof",
  "BrandTrust",
]);

const PRICING_IDS = new Set([
  "PricingTable",
  "PricingModern",
  "FinanceCalculator",
]);

const GALLERY_IDS = new Set([
  "GalleryGrid",
  "PortfolioGallery",
  "GalleryExperience",
  "DestinationsGallery",
  "CollectionsGrid",
  "MenuHighlights",
  "PortfolioGrid",
]);

const PRODUCT_IDS = new Set([
  "ProductShowcase",
  "ProductInteractive",
  "ProductGrid",
  "PropertyListings",
]);

const VEHICLE_SHOWCASE_IDS = new Set(["VehicleShowcase", "InventoryGrid"]);

const VEHICLE_DETAIL_IDS = new Set(["VehicleDetail"]);

const VEHICLE_COMPARE_IDS = new Set(["VehicleComparison", "ComparisonSection"]);

const BRANCH_IDS = new Set(["BranchesMap", "MapsSection", "LocationSections"]);

const APPOINTMENT_IDS = new Set([
  "AppointmentCalendar",
  "BookingForm",
  "BookingSection",
  "ReservationSection",
]);

const FAQ_IDS = new Set(["FaqAccordion"]);

const CTA_IDS = new Set([
  "CtaBand",
  "CtaSplit",
  "TravelCtaBand",
  "BookingCta",
  "AdmissionsCta",
]);

const CONTACT_IDS = new Set(["ContactSection", "ContactCta"]);

function jsxProp(name: string, value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") {
    return `        ${name}=${JSON.stringify(value)}\n`;
  }
  return `        ${name}={${JSON.stringify(value)}}\n`;
}

/**
 * Compose a premium home page from selected Professional Components Library IDs.
 * Passes industry production content into section components (not bare placeholders).
 */
export function composeHomePage(params: {
  componentIds: string[];
  brandName?: string;
  title?: string;
  description?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  primaryCta?: string;
  secondaryCta?: string;
  heroEyebrow?: string;
  content?: ProductionContentPack | null;
}): string {
  const ids = params.componentIds.filter(isComponentId);
  const content = params.content;

  const headerId: DesignRendererComponentId =
    ids.find((id) => HEADER_IDS.has(id)) ?? "SiteHeader";
  const footerId: DesignRendererComponentId = "SiteFooter";
  const sectionIds = ids.filter(
    (id) =>
      id !== headerId &&
      id !== footerId &&
      !HEADER_IDS.has(id),
  );

  const ordered: DesignRendererComponentId[] = [
    headerId,
    ...sectionIds,
    footerId,
  ];

  const imports = ordered.map((id) => {
    const spec = DESIGN_RENDERER_COMPONENTS[id];
    const importPath = spec.path
      .replace(/^components\//, "@/components/")
      .replace(/\.tsx?$/, "");
    return `import { ${spec.exportName} } from "${importPath}";`;
  });

  const brand = params.brandName || "Brand";
  const title = params.title || `${brand} — Professional website`;
  const description =
    params.description ||
    content?.brandTagline ||
    `${brand} website built with Trend Business AI Professional Components Library.`;
  const heroTitle = params.heroHeadline || content?.heroHeadline || title;
  const heroSubtitle =
    params.heroSubheadline || content?.heroSubheadline || description;
  const primaryCta =
    params.primaryCta || content?.primaryCta || "Get started";
  const secondaryCta =
    params.secondaryCta || content?.secondaryCta || "Learn more";
  const heroEyebrow =
    params.heroEyebrow || content?.heroEyebrow || "Premium experience";
  const navLinks = content?.navLinks || [
    { href: "#services", label: "Services" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
  ];

  const renderSection = (id: DesignRendererComponentId): string => {
    const name = DESIGN_RENDERER_COMPONENTS[id].exportName;

    if (HERO_IDS.has(id)) {
      const withSecondary = [
        "HeroLuxury",
        "HeroLuxuryShowcase",
        "HeroSplit",
        "HeroProduct",
        "HeroCinematic",
        "HeroInteractive",
      ].includes(id);
      let props = "";
      props += jsxProp("title", heroTitle);
      props += jsxProp("subtitle", heroSubtitle);
      props += jsxProp("eyebrow", heroEyebrow);
      props += jsxProp("primaryCta", primaryCta);
      if (withSecondary) props += jsxProp("secondaryCta", secondaryCta);
      if (id === "HeroVideo") {
        props += "        posterUrl={HERO_IMAGE}\n";
      } else {
        props += "        imageUrl={HERO_IMAGE}\n";
      }
      return `      <${name}\n${props}      />`;
    }

    if (SERVICES_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.servicesEyebrow)}${jsxProp("title", content.servicesTitle)}${jsxProp("subtitle", content.servicesSubtitle)}${jsxProp("items", content.services)}      />`;
    }

    if (FEATURES_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.featuresEyebrow)}${jsxProp("title", content.featuresTitle)}${jsxProp("subtitle", content.featuresSubtitle)}${jsxProp("items", content.features)}${jsxProp("features", content.features)}      />`;
    }

    if (TESTIMONIAL_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.testimonialsEyebrow)}${jsxProp("title", content.testimonialsTitle)}${jsxProp("subtitle", content.testimonialsSubtitle)}${jsxProp("items", content.testimonials)}${jsxProp("quotes", content.testimonials)}      />`;
    }

    if (PRICING_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.pricingEyebrow)}${jsxProp("title", content.pricingTitle)}${jsxProp("subtitle", content.pricingSubtitle)}${jsxProp("plans", content.pricing)}      />`;
    }

    if (GALLERY_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.galleryEyebrow)}${jsxProp("title", content.galleryTitle)}${jsxProp("subtitle", content.gallerySubtitle)}${jsxProp("items", content.galleryItems)}      />`;
    }

    if (PRODUCT_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.servicesEyebrow)}${jsxProp("title", content.servicesTitle)}${jsxProp("subtitle", content.servicesSubtitle)}${jsxProp("bullets", content.showcaseBullets)}${jsxProp("ctaLabel", primaryCta)}${jsxProp("items", content.galleryItems)}      />`;
    }

    if (VEHICLE_SHOWCASE_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.servicesEyebrow)}${jsxProp("title", content.servicesTitle)}${jsxProp("subtitle", content.servicesSubtitle)}      />`;
    }

    if (VEHICLE_DETAIL_IDS.has(id)) {
      return `      <${name}
${jsxProp("eyebrow", "Model detail")}      />`;
    }

    if (VEHICLE_COMPARE_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", "Compare")}${jsxProp("title", "Find the right model")}${jsxProp("subtitle", content.featuresSubtitle)}      />`;
    }

    if (BRANCH_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", "Locations")}${jsxProp("title", content.galleryTitle)}${jsxProp("subtitle", content.gallerySubtitle)}      />`;
    }

    if (APPOINTMENT_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", "Test drive")}${jsxProp("title", content.ctaTitle)}${jsxProp("subtitle", content.ctaBody)}      />`;
    }

    if (FAQ_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.faqEyebrow)}${jsxProp("title", content.faqTitle)}${jsxProp("subtitle", content.faqSubtitle)}${jsxProp("items", content.faqs)}${jsxProp("faqs", content.faqs)}      />`;
    }

    if (CTA_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.ctaEyebrow)}${jsxProp("title", content.ctaTitle)}${jsxProp("subtitle", content.ctaBody)}${jsxProp("primaryCta", primaryCta)}${jsxProp("secondaryCta", secondaryCta)}      />`;
    }

    if (CONTACT_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", "Contact")}${jsxProp("title", content.contactTitle)}${jsxProp("subtitle", content.contactSubtitle)}${jsxProp("ctaLabel", primaryCta)}      />`;
    }

    return `      <${name} />`;
  };

  const sectionJsx = sectionIds.map(renderSection).join("\n");

  const headerProps =
    `${jsxProp("brandName", brand)}` +
    `${jsxProp("ctaLabel", primaryCta)}` +
    `${jsxProp("links", navLinks)}`;

  const footerProps =
    `${jsxProp("brandName", brand)}` +
    `${jsxProp("tagline", content?.brandTagline || description)}` +
    `${jsxProp("links", navLinks)}`;

  return `import type { Metadata } from "next";
import { HERO_IMAGE } from "@/lib/site-images";
${imports.join("\n")}

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
      <${DESIGN_RENDERER_COMPONENTS[headerId].exportName}
${headerProps}      />
${sectionJsx}
      <${DESIGN_RENDERER_COMPONENTS[footerId].exportName}
${footerProps}      />
    </main>
  );
}
`;
}
