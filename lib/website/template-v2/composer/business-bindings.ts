import type {
  ContentCard,
  FaqItem,
  PricingPlan,
  ProductionContentPack,
} from "@/lib/ai-core/content/production-content";
import {
  getComposeUiFallbacks,
  usesLlmLocalizedWebsiteCopy,
} from "@/lib/ai-core/content/content-language";
import { isHospitalityPackage } from "@/lib/website/template-v2/composer/package-sector";

export type BusinessBindingContext = {
  brandName: string;
  packageId?: string;
  content?: ProductionContentPack | null;
  language?: string | null;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroEyebrow?: string;
  pageDescription?: string;
  primaryCta?: string;
  secondaryCta?: string;
  /** When true, omit generic fallbacks so flagship component defaults render. */
  usePackageDefaults?: boolean;
};

export function resolveBusinessCta(
  value: string | undefined,
  language: string | null | undefined,
  kind: "primary" | "secondary",
): string {
  const ui = getComposeUiFallbacks(language);
  if (value?.trim()) return value.trim();
  return kind === "primary" ? ui.primaryCta : ui.secondaryCta;
}

export function resolveBusinessNavLinks(
  content: ProductionContentPack | null | undefined,
  language?: string | null,
) {
  const ui = getComposeUiFallbacks(language);
  const fromContent = content?.navLinks
    ?.filter((l) => l.href?.trim() && l.label?.trim())
    .map((l) => ({ href: l.href, label: l.label }));
  if (fromContent?.length) return fromContent;
  return [
    { href: "#features", label: ui.navFeatures },
    { href: "#services", label: ui.navServices },
    { href: "#pricing", label: ui.navPricing },
    { href: "#contact", label: ui.navContact },
  ];
}

export function resolveHeroCopy(ctx: BusinessBindingContext) {
  const brand = ctx.brandName;
  const content = ctx.content;
  const localized = usesLlmLocalizedWebsiteCopy(ctx.language);
  const ui = getComposeUiFallbacks(ctx.language);

  if (ctx.usePackageDefaults && !ctx.heroHeadline?.trim()) {
    return {
      title: undefined,
      subtitle: undefined,
      eyebrow: undefined,
    };
  }

  const headline =
    ctx.heroHeadline?.trim() ||
    content?.heroHeadline?.trim() ||
    brand;

  let subtitle =
    ctx.heroSubheadline?.trim() || content?.heroSubheadline?.trim() || "";

  if (!subtitle && !localized) {
    subtitle =
      ctx.pageDescription?.trim() || content?.brandTagline?.trim() || "";
  }

  const eyebrow =
    ctx.heroEyebrow?.trim() ||
    content?.heroEyebrow?.trim() ||
    (localized ? ui.heroEyebrow : undefined);

  return {
    title: headline,
    subtitle: subtitle || undefined,
    eyebrow: eyebrow?.trim() || undefined,
  };
}

function mapFaqItems(faqs: FaqItem[]) {
  return faqs.map((item) => ({ question: item.q, answer: item.a }));
}

export function mapServicesToGenericItems(services: ContentCard[]) {
  return services.map((item) => ({
    title: item.title,
    description: item.body,
    body: item.body,
    cta: item.cta,
  }));
}

export function mapServicesToMenuItems(services: ContentCard[]) {
  return services.map((item, index) => ({
    course: String(index + 1),
    name: item.title,
    description: item.body,
    pairing: item.cta,
  }));
}

export function mapFeaturesToItems(features: ContentCard[]) {
  return features.map((item) => ({
    title: item.title,
    description: item.body,
    body: item.body,
  }));
}

export function mapPricingToTiers(plans: PricingPlan[], primaryCta: string) {
  return plans.map((plan) => ({
    name: plan.name,
    price: plan.price,
    period: "",
    description: plan.blurb,
    features: plan.features,
    cta: primaryCta,
    highlighted: plan.featured,
    highlightBadge: plan.featured ? plan.badge?.trim() || undefined : undefined,
  }));
}

export function mapGalleryToPortfolioItems(content: ProductionContentPack) {
  if (content.galleryItems?.length) {
    return content.galleryItems.map((item) => ({
      company: item.title,
      industry: item.tag,
      outcome: item.tag,
      outcomeLabel: item.tag,
      detail: item.title,
    }));
  }
  return (
    content.features?.map((item) => ({
      company: item.title,
      industry: content.brandTagline,
      outcome: "✓",
      outcomeLabel: item.title,
      detail: item.body,
    })) ?? []
  );
}

export type ComponentBindingInput = {
  componentId: string;
  role?: string;
  packageId?: string;
  ctx: BusinessBindingContext;
};

function sectionHeader(
  content: ProductionContentPack | null | undefined,
  keys: { eyebrow?: string; title?: string; subtitle?: string },
) {
  if (!content) return {};
  const record = content as unknown as Record<string, string | undefined>;
  return {
    eyebrow: keys.eyebrow ? record[keys.eyebrow] : undefined,
    title: keys.title ? record[keys.title] : undefined,
    subtitle: keys.subtitle ? record[keys.subtitle] : undefined,
  };
}

/** CLI / gallery stub brands — do not override flagship package chrome. */
function isGenericStubBrand(brand: string | undefined): boolean {
  const value = brand?.trim().toLowerCase() ?? "";
  return !value || value === "brand" || value === "verify";
}

/**
 * Flagship skins keep package DEFAULT_* section copy, but still accept real
 * business identity for brand / CTAs / nav when present.
 */
function buildFlagshipIdentityOverlayProps(
  input: ComponentBindingInput,
): Record<string, unknown> {
  const { componentId, role } = input;
  const ctx = input.ctx;
  const brand = ctx.brandName?.trim();
  const stubBrand = isGenericStubBrand(brand);
  const primaryCta = (ctx.primaryCta ?? ctx.content?.primaryCta)?.trim() || undefined;
  const secondaryCta =
    (ctx.secondaryCta ?? ctx.content?.secondaryCta)?.trim() || undefined;
  const navFromContent = ctx.content?.navLinks
    ?.filter((l) => l.href?.trim() && l.label?.trim())
    .map((l) => ({ href: l.href, label: l.label }));
  const effectiveRole = role ?? "";

  if (effectiveRole === "navigation" || componentId.includes("-nav")) {
    const props: Record<string, unknown> = {};
    if (!stubBrand && brand) props.brandName = brand;
    if (primaryCta) props.ctaLabel = primaryCta;
    if (navFromContent?.length) props.links = navFromContent;
    return props;
  }

  if (effectiveRole === "hero" || componentId.includes("-hero")) {
    const props: Record<string, unknown> = {};
    if (!stubBrand && brand) props.brandName = brand;
    if (primaryCta) props.primaryCta = primaryCta;
    if (secondaryCta) props.secondaryCta = secondaryCta;
    return props;
  }

  if (effectiveRole === "footer" || componentId.includes("-footer")) {
    const props: Record<string, unknown> = {};
    if (!stubBrand && brand) props.brandName = brand;
    if (navFromContent?.length) props.links = navFromContent;
    return props;
  }

  if (
    componentId.includes("floating-cta") ||
    componentId.includes("utility-band") ||
    effectiveRole === "cta"
  ) {
    const props: Record<string, unknown> = {};
    if (primaryCta) {
      props.primaryCta = primaryCta;
      props.ctaLabel = primaryCta;
    }
    if (secondaryCta) props.secondaryCta = secondaryCta;
    return props;
  }

  return {};
}

/** Map business content to component props — never package-specific demo copy. */
export function buildComponentProps(
  input: ComponentBindingInput,
): Record<string, unknown> {
  const { componentId, role } = input;
  const ctx = input.ctx;

  if (ctx.usePackageDefaults) {
    return buildFlagshipIdentityOverlayProps(input);
  }

  const packageId = input.packageId ?? ctx.packageId;
  const hospitality = isHospitalityPackage(packageId);
  const content = ctx.content;
  const brand = ctx.brandName;
  const language = ctx.language;
  const primaryCta = resolveBusinessCta(
    ctx.primaryCta ?? content?.primaryCta,
    language,
    "primary",
  );
  const secondaryCta = resolveBusinessCta(
    ctx.secondaryCta ?? content?.secondaryCta,
    language,
    "secondary",
  );
  const navLinks = resolveBusinessNavLinks(content, language);
  const hero = resolveHeroCopy(ctx);
  const localized = usesLlmLocalizedWebsiteCopy(language);
  const effectiveRole = role ?? "";

  if (effectiveRole === "navigation" || componentId.includes("-nav")) {
    return { brandName: brand, ctaLabel: primaryCta, links: navLinks };
  }

  if (effectiveRole === "hero" || componentId.includes("-hero")) {
    const heroProps: Record<string, unknown> = {
      primaryCta,
      secondaryCta,
      brandName: brand,
    };
    if (hero.title !== undefined) heroProps.title = hero.title;
    if (hero.subtitle !== undefined) {
      heroProps.subtitle = localized ? (hero.subtitle ?? "") : hero.subtitle;
    }
    if (hero.eyebrow !== undefined) {
      heroProps.eyebrow = localized ? (hero.eyebrow ?? "") : hero.eyebrow;
    }
    return heroProps;
  }

  if (effectiveRole === "footer" || componentId.includes("-footer")) {
    return {
      brandName: brand,
      tagline: content?.brandTagline ?? ctx.pageDescription,
      links: navLinks,
    };
  }

  if ((effectiveRole === "faq" || componentId.includes("-faq")) && content?.faqs?.length) {
    return {
      ...sectionHeader(content, {
        eyebrow: "faqEyebrow",
        title: "faqTitle",
        subtitle: "faqSubtitle",
      }),
      items: mapFaqItems(content.faqs),
    };
  }

  if ((effectiveRole === "pricing" || componentId.includes("-pricing")) && content?.pricing?.length) {
    return {
      ...sectionHeader(content, {
        eyebrow: "pricingEyebrow",
        title: "pricingTitle",
        subtitle: "pricingSubtitle",
      }),
      tiers: mapPricingToTiers(content.pricing, primaryCta),
    };
  }

  if (
    (effectiveRole === "features" ||
      (hospitality && componentId.includes("signature-dishes"))) &&
    content?.features?.length
  ) {
    return {
      ...sectionHeader(content, {
        eyebrow: "featuresEyebrow",
        title: "featuresTitle",
        subtitle: "featuresSubtitle",
      }),
      items: mapFeaturesToItems(content.features),
    };
  }

  if (effectiveRole === "gallery" || componentId.includes("-gallery")) {
    return {
      ...sectionHeader(content, {
        eyebrow: "galleryEyebrow",
        title: "galleryTitle",
        subtitle: "gallerySubtitle",
      }),
      items: content?.galleryItems,
    };
  }

  if (
    effectiveRole === "story" ||
    (hospitality && componentId.includes("chef-story")) ||
    componentId.includes("-about")
  ) {
    return {
      eyebrow: content?.servicesEyebrow,
      title: content?.servicesTitle,
      subtitle: content?.servicesSubtitle,
      body: content?.servicesSubtitle,
      highlights: content?.showcaseBullets,
      primaryCta,
    };
  }

  if (
    (effectiveRole === "services" ||
      (hospitality && componentId.includes("tasting-menu"))) &&
    content?.services?.length
  ) {
    return {
      ...sectionHeader(content, {
        eyebrow: "servicesEyebrow",
        title: "servicesTitle",
        subtitle: "servicesSubtitle",
      }),
      items: hospitality
        ? mapServicesToMenuItems(content.services)
        : mapServicesToGenericItems(content.services),
    };
  }

  if (effectiveRole === "contact" || componentId.includes("-contact")) {
    return {
      eyebrow: content?.ctaEyebrow,
      title: content?.contactTitle,
      subtitle: content?.contactSubtitle,
      ctaLabel: primaryCta,
      submitLabel: primaryCta,
    };
  }

  if (effectiveRole === "integrations" || componentId.includes("-integrations")) {
    const categories = [
      "Foundation",
      "Expression",
      "Delivery",
      "Partnership",
      "Platform",
      "Workflow",
      "Analytics",
      "Support",
    ];
    if (content?.features?.length) {
      const logos = content.features.slice(0, 8).map((feature, index) => ({
        name: feature.title,
        category: categories[index % categories.length]!,
        description: feature.description,
        abbr: String(index + 1).padStart(2, "0"),
      }));
      return {
        ...sectionHeader(content, {
          eyebrow: "featuresEyebrow",
          title: "featuresTitle",
          subtitle: "featuresSubtitle",
        }),
        logos,
        footnote: content?.brandTagline,
      };
    }
    if (content?.services?.length) {
      const logos = content.services.slice(0, 8).map((service, index) => ({
        name: service.title,
        category: categories[index % categories.length]!,
        description: service.description,
        abbr: String(index + 1).padStart(2, "0"),
      }));
      return {
        ...sectionHeader(content, {
          eyebrow: "featuresEyebrow",
          title: "featuresTitle",
          subtitle: "featuresSubtitle",
        }),
        logos,
        footnote: content?.brandTagline,
      };
    }
    const names = [
      ...(content?.services?.map((s) => s.title) ?? []),
      ...(content?.features?.map((f) => f.title) ?? []),
      ...(content?.showcaseBullets ?? []),
    ].filter((name) => name?.trim());
    const logos = names.slice(0, 8).map((name, index) => ({
      name,
      category: categories[index % categories.length]!,
      abbr: String(index + 1).padStart(2, "0"),
    }));

    return {
      ...sectionHeader(content, {
        eyebrow: "featuresEyebrow",
        title: "featuresTitle",
        subtitle: "featuresSubtitle",
      }),
      logos: logos.length ? logos : undefined,
      footnote: content?.brandTagline,
    };
  }

  if (componentId.includes("-security") && content) {
    const bullets = content.showcaseBullets ?? [];
    return {
      ...sectionHeader(content, {
        eyebrow: "servicesEyebrow",
        title: "servicesTitle",
        subtitle: "servicesSubtitle",
      }),
      badges: bullets.map((label) => ({ label })),
      footnote: content.trustLine,
    };
  }

  if (componentId.includes("portfolio") && content) {
    return {
      ...sectionHeader(content, {
        eyebrow: "galleryEyebrow",
        title: "galleryTitle",
        subtitle: "gallerySubtitle",
      }),
      items: mapGalleryToPortfolioItems(content),
    };
  }

  if (
    (effectiveRole === "testimonials" || componentId.includes("-testimonials")) &&
    content?.testimonials?.length
  ) {
    return {
      ...sectionHeader(content, {
        eyebrow: "testimonialsEyebrow",
        title: "testimonialsTitle",
        subtitle: "testimonialsSubtitle",
      }),
      items: content.testimonials,
    };
  }

  if (effectiveRole === "process" || componentId.includes("care-journey")) {
    return sectionHeader(content, {
      eyebrow: "servicesEyebrow",
      title: "servicesTitle",
      subtitle: "servicesSubtitle",
    });
  }

  if (
    effectiveRole === "team" ||
    componentId.includes("-physicians") ||
    componentId.includes("-advisors")
  ) {
    return sectionHeader(content, {
      eyebrow: "servicesEyebrow",
      title: "servicesTitle",
      subtitle: "servicesSubtitle",
    });
  }

  if (
    effectiveRole === "cta" ||
    componentId.includes("floating-cta") ||
    componentId.includes("utility-band") ||
    (hospitality && componentId.includes("reservation-cta"))
  ) {
    const ctaProps: Record<string, unknown> = {
      eyebrow: content?.ctaEyebrow,
      title: content?.ctaTitle,
      subtitle: content?.ctaBody ?? content?.contactSubtitle,
      ctaLabel: primaryCta,
      primaryCta,
      secondaryCta,
    };
    if (hospitality && componentId.includes("reservation-cta")) {
      const record = content as unknown as Record<string, string | undefined> | null;
      ctaProps.footnote =
        record?.reservationFootnote?.trim() ||
        record?.serviceHours?.trim() ||
        undefined;
    }
    if (content?.showcaseBullets?.length) {
      ctaProps.badges = content.showcaseBullets.slice(0, 3);
    }
    return ctaProps;
  }

  if (componentId.includes("sidebar-rail")) {
    const railProps: Record<string, unknown> = { links: navLinks };
    if (hospitality) {
      const record = content as unknown as Record<string, string | undefined> | null;
      railProps.hoursNote =
        record?.serviceHours?.trim() ||
        record?.hoursNote?.trim() ||
        undefined;
    }
    return railProps;
  }

  if (componentId.includes("-stats") && content) {
    const bullets = content.showcaseBullets?.length
      ? content.showcaseBullets
      : (content.features ?? []).map((f) => f.title);
    return {
      ...sectionHeader(content, {
        eyebrow: "featuresEyebrow",
        title: "featuresTitle",
        subtitle: "featuresSubtitle",
      }),
      stats: bullets.slice(0, 4).map((label, index) => ({
        value: String(index + 1),
        label,
      })),
    };
  }

  if (hospitality && componentId.includes("atmosphere") && content) {
    return sectionHeader(content, {
      eyebrow: "galleryEyebrow",
      title: "galleryTitle",
      subtitle: "gallerySubtitle",
    });
  }

  return {};
}

const TEXT_SLOT_KEYS = new Set([
  "title",
  "subtitle",
  "eyebrow",
  "primaryCta",
  "secondaryCta",
  "tagline",
  "ctaLabel",
  "submitLabel",
  "body",
]);

export function propsToJsx(
  props: Record<string, unknown>,
  opts?: { localizedCopy?: boolean },
): string {
  let out = "";
  for (const [name, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (
      value === "" &&
      !(opts?.localizedCopy && TEXT_SLOT_KEYS.has(name))
    ) {
      continue;
    }
    if (Array.isArray(value) && value.length === 0) continue;
    out += `        ${name}={${JSON.stringify(value)}}\n`;
  }
  return out;
}
