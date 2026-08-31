import { DESIGN_RENDERER_COMPONENTS } from "@/lib/ai-core/design-renderer/components";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import {
  getComposeUiFallbacks,
  resolveContentLanguage,
  usesLlmLocalizedWebsiteCopy,
} from "@/lib/ai-core/content/content-language";
import type { ThemePageTopology } from "@/lib/website/builder/theme-architecture";
import {
  getThemeComponentRole,
  isThemeFloatingCtaComponent,
  isThemeFooterComponent,
  isThemeHeroComponent,
  isThemeNavComponent,
  isThemeScopedComponent,
} from "@/lib/website/builder/theme-component-registry";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";

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
  "NavSidebar",
  "NavHamburger",
  "NavCentered",
  "SiteHeader",
]);

const FOOTER_IDS = new Set([
  "SiteFooter",
  "SiteFooterMinimal",
  "SiteFooterEditorial",
]);

const CHROME_IDS_LEGACY = new Set([...HEADER_IDS, ...FOOTER_IDS, "FloatingCta"]);

function isChromeComponent(id: string): boolean {
  if (isThemeScopedComponent(id)) {
    const role = getThemeComponentRole(id);
    return (
      role === "nav" ||
      role === "footer" ||
      role === "floating-cta"
    );
  }
  return CHROME_IDS_LEGACY.has(id);
}

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

const BLOG_IDS = new Set(["BlogSection"]);

const TIMELINE_IDS = new Set(["TimelineSection", "ProcessSteps"]);

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
  /** Exact home page order (header → sections → footer) from Template DNA. */
  homeComponentOrder?: string[];
  brandName?: string;
  title?: string;
  description?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  primaryCta?: string;
  secondaryCta?: string;
  heroEyebrow?: string;
  content?: ProductionContentPack | null;
  language?: string | null;
  /** Template Intelligence id for body class + layout hooks. */
  templateId?: string | null;
  /** Curated theme id for exclusive component library resolution. */
  websiteThemeId?: WebsiteThemePresetId | string | null;
  /** Theme page topology — drives distinct page trees per theme. */
  pageTopology?: ThemePageTopology | null;
  /** Inject persistent floating CTA (technology / bold themes). */
  floatingCta?: boolean;
  /** When true, compose full section JSX even for localized LLM copy languages. */
  forceDesignRebuild?: boolean;
  visualSkinId?: string | null;
  heroLayoutMode?: string | null;
}): string {
  const sourceIds =
    params.homeComponentOrder?.length
      ? params.homeComponentOrder
      : params.componentIds;
  const ids = sourceIds.filter(isComponentId);
  const content = params.content;
  const ui = getComposeUiFallbacks(params.language);
  const contentLang = resolveContentLanguage(params.language);
  const localized =
    usesLlmLocalizedWebsiteCopy(params.language) && !params.forceDesignRebuild;

  const headerId: DesignRendererComponentId =
    ids.find((id) => isThemeNavComponent(id) || HEADER_IDS.has(id)) ??
    "SiteHeader";
  const footerId: DesignRendererComponentId =
    ids.find((id) => isThemeFooterComponent(id) || FOOTER_IDS.has(id)) ??
    "SiteFooter";
  const floatingCta =
    params.floatingCta ??
    ids.some((id) => isThemeFloatingCtaComponent(id) || id === "FloatingCta");
  const pageTopology = params.pageTopology ?? "classic-stack";

  const sectionIds = ids.filter((id) => !isChromeComponent(id));

  const floatingId: DesignRendererComponentId =
    ids.find((id) => isThemeFloatingCtaComponent(id)) ?? "FloatingCta";

  const ordered: DesignRendererComponentId[] = params.homeComponentOrder?.length
    ? ids.filter(
        (id) =>
          isComponentId(id) &&
          (id === headerId ||
            id === footerId ||
            id === floatingId ||
            sectionIds.includes(id)),
      )
    : [
        headerId,
        ...sectionIds,
        footerId,
        ...(floatingCta ? [floatingId] : []),
      ];

  const importIds = new Set(ordered);
  if (floatingCta) importIds.add(floatingId);

  const imports = Array.from(importIds).map((id) => {
    const spec = DESIGN_RENDERER_COMPONENTS[id];
    const importPath = spec.path
      .replace(/^components\//, "@/components/")
      .replace(/\.tsx?$/, "");
    return `import { ${spec.exportName} } from "${importPath}";`;
  });

  const brand = params.brandName || (contentLang === "ar" ? "العلامة" : "Brand");
  const title = params.title || `${brand} — ${ui.pageTitleSuffix}`;
  const description =
    params.description ||
    content?.brandTagline ||
    `${brand} ${ui.pageDescriptionSuffix}`;
  const heroTitle = params.heroHeadline || content?.heroHeadline || title;
  const heroSubtitle =
    params.heroSubheadline || content?.heroSubheadline || description;
  const primaryCta =
    params.primaryCta || content?.primaryCta || ui.primaryCta;
  const secondaryCta =
    params.secondaryCta || content?.secondaryCta || ui.secondaryCta;
  const heroEyebrow =
    params.heroEyebrow || content?.heroEyebrow || ui.heroEyebrow;
  const navLinks = content?.navLinks || [
    { href: "#services", label: ui.navServices },
    { href: "#features", label: ui.navFeatures },
    { href: "#pricing", label: ui.navPricing },
    { href: "#contact", label: ui.navContact },
  ];

  const renderSection = (id: DesignRendererComponentId): string => {
    const name = DESIGN_RENDERER_COMPONENTS[id].exportName;
    const themeRole = getThemeComponentRole(id);

    if (themeRole === "nav") {
      return `      <${name}
${jsxProp("brandName", brand)}${jsxProp("ctaLabel", primaryCta)}${jsxProp("links", navLinks)}      />`;
    }

    if (themeRole === "hero") {
      let props = "";
      props += jsxProp("title", heroTitle);
      props += jsxProp("subtitle", heroSubtitle);
      props += jsxProp("eyebrow", heroEyebrow);
      props += jsxProp("primaryCta", primaryCta);
      props += jsxProp("secondaryCta", secondaryCta);
      props += "        imageUrl={HERO_IMAGE}\n";
      return `      <${name}\n${props}      />`;
    }

    if (themeRole === "footer") {
      return `      <${name}
${jsxProp("brandName", brand)}${jsxProp("tagline", content?.brandTagline || description)}${jsxProp("links", navLinks)}      />`;
    }

    if (themeRole === "floating-cta") {
      return `      <${name}
${jsxProp("primaryCta", primaryCta)}${jsxProp("secondaryCta", secondaryCta)}      />`;
    }

    if (themeRole && content) {
      if (
        themeRole === "features" ||
        themeRole === "story" ||
        themeRole === "blog"
      ) {
        return `      <${name}
${jsxProp("eyebrow", content.featuresEyebrow)}${jsxProp("title", content.featuresTitle)}${jsxProp("subtitle", content.featuresSubtitle)}${jsxProp("items", content.features)}${jsxProp("features", content.features)}      />`;
      }
      if (themeRole === "services" || themeRole === "process") {
        return `      <${name}
${jsxProp("eyebrow", content.servicesEyebrow)}${jsxProp("title", content.servicesTitle)}${jsxProp("subtitle", content.servicesSubtitle)}${jsxProp("items", content.services)}      />`;
      }
      if (themeRole === "testimonials" || themeRole === "trust") {
        return `      <${name}
${jsxProp("eyebrow", content.testimonialsEyebrow)}${jsxProp("title", content.testimonialsTitle)}${jsxProp("subtitle", content.testimonialsSubtitle)}${jsxProp("items", content.testimonials)}${jsxProp("quotes", content.testimonials)}      />`;
      }
      if (themeRole === "pricing") {
        return `      <${name}
${jsxProp("eyebrow", content.pricingEyebrow)}${jsxProp("title", content.pricingTitle)}${jsxProp("subtitle", content.pricingSubtitle)}${jsxProp("plans", content.pricing)}      />`;
      }
      if (themeRole === "faq") {
        return `      <${name}
${jsxProp("eyebrow", content.faqEyebrow)}${jsxProp("title", content.faqTitle)}${jsxProp("subtitle", content.faqSubtitle)}${jsxProp("items", content.faqs)}${jsxProp("faqs", content.faqs)}      />`;
      }
      if (
        themeRole === "gallery" ||
        themeRole === "portfolio" ||
        themeRole === "cases"
      ) {
        return `      <${name}
${jsxProp("eyebrow", content.galleryEyebrow)}${jsxProp("title", content.galleryTitle)}${jsxProp("subtitle", content.gallerySubtitle)}${jsxProp("items", content.galleryItems)}      />`;
      }
      if (themeRole === "integrations") {
        return `      <${name}
${jsxProp("eyebrow", content.featuresEyebrow)}${jsxProp("title", content.featuresTitle)}${jsxProp("subtitle", content.featuresSubtitle)}      />`;
      }
      if (themeRole === "timeline") {
        return `      <${name}
${jsxProp("eyebrow", content.servicesEyebrow)}${jsxProp("title", content.servicesTitle)}${jsxProp("subtitle", content.servicesSubtitle)}      />`;
      }
      if (themeRole === "cta") {
        return `      <${name}
${jsxProp("eyebrow", content.ctaEyebrow)}${jsxProp("title", content.ctaTitle)}${jsxProp("subtitle", content.ctaBody)}${jsxProp("primaryCta", primaryCta)}${jsxProp("secondaryCta", secondaryCta)}      />`;
      }
      if (themeRole === "contact") {
        return `      <${name}
${jsxProp("eyebrow", ui.navContact)}${jsxProp("title", content.contactTitle)}${jsxProp("subtitle", content.contactSubtitle)}${jsxProp("ctaLabel", primaryCta)}      />`;
      }
    }

    if (HERO_IDS.has(id) || isThemeHeroComponent(id)) {
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
      if (params.heroLayoutMode && isThemeHeroComponent(id)) {
        props += jsxProp("layoutMode", params.heroLayoutMode);
      }
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
      if (localized) return "";
      return `      <${name}
${jsxProp("eyebrow", "Model detail")}      />`;
    }

    if (VEHICLE_COMPARE_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", localized ? content.featuresEyebrow : "Compare")}${jsxProp("title", localized ? content.featuresTitle : "Find the right model")}${jsxProp("subtitle", content.featuresSubtitle)}      />`;
    }

    if (BRANCH_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", localized ? content.galleryEyebrow : "Locations")}${jsxProp("title", content.galleryTitle)}${jsxProp("subtitle", content.gallerySubtitle)}      />`;
    }

    if (APPOINTMENT_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", localized ? content.ctaEyebrow : "Test drive")}${jsxProp("title", content.ctaTitle)}${jsxProp("subtitle", content.ctaBody)}      />`;
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
${jsxProp("eyebrow", ui.navContact)}${jsxProp("title", content.contactTitle)}${jsxProp("subtitle", content.contactSubtitle)}${jsxProp("ctaLabel", primaryCta)}      />`;
    }

    if (BLOG_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.featuresEyebrow)}${jsxProp("title", content.featuresTitle)}${jsxProp("subtitle", content.featuresSubtitle)}${jsxProp("items", content.features)}      />`;
    }

    if (TIMELINE_IDS.has(id) && content) {
      return `      <${name}
${jsxProp("eyebrow", content.servicesEyebrow)}${jsxProp("title", content.servicesTitle)}${jsxProp("subtitle", content.servicesSubtitle)}      />`;
    }

    if (id === "FloatingCta") {
      return `      <${name}
${jsxProp("primaryCta", primaryCta)}${jsxProp("secondaryCta", secondaryCta)}      />`;
    }

    if (localized) {
      return "";
    }

    return `      <${name} />`;
  };

  const bodySections = (params.homeComponentOrder?.length ? ordered : sectionIds)
    .filter((id) => !isChromeComponent(id))
    .map(renderSection)
    .filter(Boolean)
    .join("\n");

  const heroSection = sectionIds.find(
    (id) => HERO_IDS.has(id) || isThemeHeroComponent(id),
  );
  const afterHeroSections = sectionIds
    .filter((id) => id !== heroSection)
    .map(renderSection)
    .filter(Boolean)
    .join("\n");
  const heroJsx = heroSection ? renderSection(heroSection) : "";

  const templateClass = params.templateId
    ? ` ti-template ti-${params.templateId.replace(/^ti-/, "")}`
    : "";
  const themeClass = params.websiteThemeId
    ? ` ti-theme-${params.websiteThemeId}`
    : "";
  const skinClass = params.visualSkinId ? ` tb-skin-page tb-skin-${params.visualSkinId}` : "";
  const topologyClass = ` ti-topology-${pageTopology.replace(/-/g, "_")}`;
  const rootClass =
    `min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased${templateClass}${themeClass}${skinClass}${topologyClass}`;

  const headerProps =
    `${jsxProp("brandName", brand)}` +
    `${jsxProp("ctaLabel", primaryCta)}` +
    `${jsxProp("links", navLinks)}`;

  const footerProps =
    `${jsxProp("brandName", brand)}` +
    `${jsxProp("tagline", content?.brandTagline || description)}` +
    `${jsxProp("links", navLinks)}`;

  const headerJsx = `      <${DESIGN_RENDERER_COMPONENTS[headerId].exportName}
${headerProps}      />`;
  const footerJsx = `      <${DESIGN_RENDERER_COMPONENTS[footerId].exportName}
${footerProps}      />`;
  const floatingImportId = ids.find((id) => isThemeFloatingCtaComponent(id));
  const floatingComponentName = floatingImportId
    ? DESIGN_RENDERER_COMPONENTS[floatingImportId].exportName
    : DESIGN_RENDERER_COMPONENTS.FloatingCta.exportName;
  const floatingJsx = floatingCta
    ? `      <${floatingComponentName}
${jsxProp("primaryCta", primaryCta)}${jsxProp("secondaryCta", secondaryCta)}      />`
    : "";

  let pageBody = "";

  if (pageTopology === "sidebar-rail") {
    pageBody = `    <div className=${JSON.stringify(`${rootClass} lg:pl-[min(18rem,88vw)]`)}>
${headerJsx}
      <main className="relative">
${heroJsx}
${afterHeroSections}
${footerJsx}
      </main>
${floatingJsx}
    </div>`;
  } else if (pageTopology === "fullscreen-editorial") {
    pageBody = `    <main className=${JSON.stringify(rootClass)}>
${headerJsx}
${heroJsx}
      <div className="relative z-10 bg-[var(--color-background)]">
${afterHeroSections}
${footerJsx}
      </div>
${floatingJsx}
    </main>`;
  } else if (pageTopology === "card-first-masonry") {
    pageBody = `    <main className=${JSON.stringify(`${rootClass} ti-card-first`)}>
${headerJsx}
      <div className="divide-y divide-[var(--color-foreground)]/6">
${bodySections}
      </div>
${footerJsx}
${floatingJsx}
    </main>`;
  } else {
    pageBody = `    <main className=${JSON.stringify(rootClass)}>
${headerJsx}
${bodySections}
${footerJsx}
${floatingJsx}
    </main>`;
  }

  return `import type { Metadata } from "next";
import { HERO_IMAGE } from "@/lib/site-images";
${imports.join("\n")}

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
};

export default function HomePage() {
  return (
${pageBody}
  );
}
`;
}
