import { selectProfessionalComponents } from "@/lib/ai-core/components/select";
import {
  componentPathFor,
  getRendererComponent,
} from "@/lib/ai-core/design-renderer/components";
import {
  getIndustryDesignPreset,
  type IndustryDesignPreset,
  type IndustryDesignPresetSection,
} from "@/lib/ai-core/design-renderer/presets";
import type {
  DesignRendererComponentId,
  DesignRendererInput,
  DesignRendererResult,
  DesignRendererSection,
  DesignRenderPlan,
} from "@/lib/ai-core/design-renderer/types";
import { isIndustryId } from "@/lib/ai-core/templates/industries";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import type {
  CoreDesignSystem,
  CoreProductStrategy,
  CoreStrategySection,
} from "@/lib/ai-core/layers/types";

function resolveIndustryId(input: DesignRendererInput): IndustryId {
  const raw = String(input.industryId || "").trim().toLowerCase();
  if (raw && isIndustryId(raw)) return raw;

  const label = String(input.industryLabel || "").toLowerCase();
  if (label.includes("tour") || label.includes("travel")) return "tourism";
  if (label.includes("auto") || label.includes("car")) return "automotive";
  if (label.includes("real") || label.includes("property")) return "real-estate";
  if (label.includes("saas") || label.includes("software")) return "saas";
  if (label.includes("restaurant") || label.includes("dining")) return "restaurant";
  if (
    label.includes("health") ||
    label.includes("clinic") ||
    label.includes("medical")
  ) {
    return "clinic";
  }
  if (label.includes("educat") || label.includes("school")) return "education";
  if (label.includes("e-com") || label.includes("shop") || label.includes("retail")) {
    return "ecommerce";
  }
  if (label.includes("agency") || label.includes("studio")) return "agency";

  const pattern = String(input.designSystem.industryPattern || "").toLowerCase();
  if (pattern.includes("travel") || pattern.includes("tourism")) return "tourism";
  if (pattern.includes("auto")) return "automotive";
  if (pattern.includes("real-estate") || pattern.includes("property")) {
    return "real-estate";
  }
  if (pattern.includes("saas") || pattern.includes("product")) return "saas";

  return "agency";
}

function fallbackPreset(industryId: IndustryId): IndustryDesignPreset {
  return {
    industryId,
    label: industryId,
    layoutStyle: "corporate-trust",
    visualStyle: {
      layoutStyle: "corporate-trust",
      density: "balanced",
      heroTreatment: "Professional hero with clear CTA",
      cardTreatment: "Clean service/feature cards",
      ctaTreatment: "Primary Get started CTA",
      motionNotes: "Subtle section reveals",
      uiPatterns: [
        "full-bleed cinematic hero",
        "service cards",
        "testimonial cards",
        "contact CTA + form",
      ],
    },
    homeSections: [
      { name: "Hero", componentId: "HeroFullBleed", assetRole: "hero" },
      { name: "Services", componentId: "ServicesGrid", assetRole: "service" },
      { name: "Features", componentId: "FeatureHighlights", assetRole: "section" },
      { name: "Testimonials", componentId: "TestimonialsCarousel" },
      { name: "Contact", componentId: "ContactCta" },
    ],
    layoutRules: [
      "Hero first, then services/features, proof, contact",
      "Use concrete section components — not generic placeholder blocks",
    ],
  };
}

function toRenderedSection(
  section: IndustryDesignPresetSection,
  page: string,
  index: number,
): DesignRendererSection {
  const spec = getRendererComponent(section.componentId);
  return {
    id: `${page.toLowerCase().replace(/\s+/g, "-")}-${section.componentId.toLowerCase()}-${index}`,
    page,
    name: section.name,
    componentId: section.componentId,
    componentPath: componentPathFor(section.componentId),
    pattern: spec.pattern,
    goal: section.goal || spec.defaultGoal,
    contentNotes: section.contentNotes || spec.description,
    assetRole: section.assetRole,
    sortOrder: (index + 1) * 10,
  };
}

function buildSections(
  preset: IndustryDesignPreset,
  strategy: CoreProductStrategy,
  websiteSections?: string[],
): DesignRendererSection[] {
  const pages =
    strategy.pages?.length > 0
      ? strategy.pages
      : [{ name: "Home", path: "/", purpose: "Home", keySections: [] }];

  const homeName =
    pages.find((p) => p.path === "/" || p.name.toLowerCase() === "home")?.name ||
    pages[0]?.name ||
    "Home";

  const home = preset.homeSections.map((section, index) =>
    toRenderedSection(section, homeName, index),
  );

  const out: DesignRendererSection[] = [...home];
  let cursor = home.length;

  for (const page of pages) {
    if (page.name === homeName) continue;
    const mapped = preset.pageSections?.[page.name];
    if (mapped?.length) {
      for (const section of mapped) {
        out.push(toRenderedSection(section, page.name, cursor));
        cursor += 1;
      }
      continue;
    }

    // Fall back to strategy keySections mapped loosely onto Contact/Cta/SocialProof.
    const keys =
      page.keySections?.length > 0
        ? page.keySections
        : (websiteSections ?? []).slice(0, 3);
    if (!keys.length) {
      out.push(
        toRenderedSection(
          { name: "Contact", componentId: "ContactCta" },
          page.name,
          cursor,
        ),
      );
      cursor += 1;
      continue;
    }
    for (const key of keys.slice(0, 4)) {
      const lower = key.toLowerCase();
      let componentId: DesignRendererComponentId = "FeatureHighlights";
      if (lower.includes("contact") || lower.includes("inquiry")) {
        componentId = "ContactCta";
      } else if (lower.includes("testimonial") || lower.includes("review")) {
        componentId = "TestimonialsCarousel";
      } else if (lower.includes("faq")) {
        componentId = "FaqAccordion";
      } else if (lower.includes("cta") || lower.includes("book")) {
        componentId = "CtaBand";
      } else if (lower.includes("service")) {
        componentId = "ServicesGrid";
      }
      out.push(
        toRenderedSection({ name: key, componentId }, page.name, cursor),
      );
      cursor += 1;
    }
  }

  return out;
}

function applyToStrategy(
  strategy: CoreProductStrategy,
  sections: DesignRendererSection[],
  ctaTypes?: string[],
): CoreProductStrategy {
  const sectionPlan: CoreStrategySection[] = sections.map((section) => ({
    id: section.id,
    page: section.page,
    name: section.name,
    goal: section.goal,
    contentNotes: [
      `Component: ${section.componentId}`,
      `File: ${section.componentPath}`,
      `Pattern: ${section.pattern}`,
      section.contentNotes,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const byPage = new Map<string, string[]>();
  for (const section of sections) {
    const list = byPage.get(section.page) ?? [];
    list.push(section.name);
    byPage.set(section.page, list);
  }

  const pages = (strategy.pages?.length ? strategy.pages : []).map((page) => ({
    ...page,
    keySections: byPage.get(page.name) ?? page.keySections,
    primaryCta: page.primaryCta || ctaTypes?.[0],
  }));

  // Ensure home exists with rendered key sections.
  if (!pages.length && sections.length) {
    const homePage = sections[0]?.page || "Home";
    pages.push({
      name: homePage,
      path: "/",
      purpose: "Primary conversion page",
      keySections: byPage.get(homePage) ?? sections.map((s) => s.name),
      primaryCta: ctaTypes?.[0],
    });
  }

  return {
    ...strategy,
    pages,
    sectionPlan,
    contentStructure: Array.from(
      new Set(sections.map((s) => s.name)),
    ),
    ctas:
      ctaTypes?.length && (!strategy.ctas || strategy.ctas.length < 2)
        ? ctaTypes.slice(0, 4)
        : strategy.ctas,
  };
}

function applyToDesignSystem(
  designSystem: CoreDesignSystem,
  plan: DesignRenderPlan,
  designStyle?: string,
): CoreDesignSystem {
  const palette = plan.componentPalette.map(String);
  const premiumLayout = designSystem.premium?.layout;
  return {
    ...designSystem,
    style: designStyle || plan.visualStyle.heroTreatment || designSystem.style,
    layoutStyle: plan.layoutStyle || designSystem.layoutStyle,
    layoutRules: Array.from(
      new Set([
        ...(plan.layoutRules ?? []),
        ...(premiumLayout?.rules ?? []),
        ...(designSystem.layoutRules ?? []),
      ]),
    ).slice(0, 16),
    uiPatterns: Array.from(
      new Set([
        ...(premiumLayout
          ? [
              premiumLayout.heroStyle,
              premiumLayout.sectionLayout,
              premiumLayout.cardStyle,
              premiumLayout.navigationStyle,
              premiumLayout.footerStyle,
            ]
          : []),
        ...plan.visualStyle.uiPatterns,
        ...(designSystem.uiPatterns ?? []),
      ]),
    ).slice(0, 16),
    componentPalette: Array.from(
      new Set([...palette, ...(designSystem.componentPalette ?? [])]),
    ).slice(0, 24),
  };
}

/**
 * Transform industry + strategy + design system into a premium render plan
 * and rewrite sectionPlan / componentPalette for generation.
 * Uses Professional Components Library selection when audience/style signals exist.
 */
export function renderWebsiteDesign(
  input: DesignRendererInput,
): DesignRendererResult {
  const industryId = resolveIndustryId(input);
  const preset =
    getIndustryDesignPreset(industryId) ?? fallbackPreset(industryId);

  const selection = selectProfessionalComponents({
    industryId,
    industryLabel: input.industryLabel || preset.label,
    businessType: input.businessType || input.industryLabel,
    designStyle: input.designStyle || preset.visualStyle.heroTreatment,
    stylePreset: input.stylePreset || input.designSystem.stylePreset,
    layoutStyle: input.designSystem.layoutStyle || preset.layoutStyle,
    targetAudience: input.targetAudience,
    websiteGoal: input.websiteGoal,
    businessGoals: input.businessGoals,
    positioning: input.positioning || input.strategy.positioning,
    requiredSections: input.websiteSections ?? [],
    ctaTypes: input.ctaTypes,
    premiumHeroStyle:
      input.premiumHeroStyle || input.designSystem.premium?.layout?.heroStyle,
    premiumSectionLayout:
      input.premiumSectionLayout ||
      input.designSystem.premium?.layout?.sectionLayout,
    brandName: input.brandName,
  });

  // Intelligence-selected home sections, then preset/page sections for other pages.
  const homeName =
    input.strategy.pages?.find(
      (p) => p.path === "/" || p.name.toLowerCase() === "home",
    )?.name ||
    input.strategy.pages?.[0]?.name ||
    "Home";

  // Premium Templates System wins for home section order + components when present.
  const premiumHome = input.premiumHomeSections?.length
    ? input.premiumHomeSections.map((section, index) =>
        toRenderedSection(
          {
            name: section.name,
            componentId: section.componentId,
            goal: section.goal,
            contentNotes:
              section.contentNotes ||
              `Premium template section · ${section.name}`,
            assetRole: section.assetRole,
          },
          homeName,
          index,
        ),
      )
    : null;

  const intelligentHome =
    premiumHome ??
    selection.homeSections.map((section, index) =>
      toRenderedSection(
        {
          name: section.name,
          componentId: section.componentId,
          goal: section.goal,
          contentNotes: section.contentNotes,
          assetRole: section.assetRole,
        },
        homeName,
        index,
      ),
    );

  const presetSections = buildSections(
    preset,
    input.strategy,
    input.websiteSections,
  );
  const nonHome = presetSections.filter((s) => s.page !== homeName);
  const sections = [...intelligentHome, ...nonHome];

  const componentPalette = Array.from(
    new Set([
      ...(input.premiumRecommendedComponents ?? []),
      ...selection.componentPalette,
      ...sections.map((s) => s.componentId),
    ]),
  ) as DesignRendererComponentId[];

  // Always include a nav + footer shell for generation.
  const hasNav = componentPalette.some((id) =>
    ["SiteHeader", "SiteHeaderTransparent", "NavModern"].includes(id),
  );
  if (!hasNav) {
    componentPalette.unshift("SiteHeader");
  }
  if (!componentPalette.includes("SiteFooter")) {
    componentPalette.push("SiteFooter");
  }

  const componentPaths = Array.from(
    new Set([
      "components/ui/section-shell.tsx",
      "components/ui/motion.tsx",
      ...selection.componentPaths,
      ...sections.map((s) => s.componentPath),
    ]),
  );

  const plan: DesignRenderPlan = {
    industryId,
    industryLabel: preset.label,
    layoutStyle: preset.layoutStyle,
    visualStyle: {
      ...preset.visualStyle,
      heroTreatment: `${selection.navVariant} nav · ${selection.heroVariant} hero · goal=${selection.websiteGoal}`,
      uiPatterns: Array.from(
        new Set([
          `${selection.navVariant}-nav`,
          `${selection.heroVariant}-hero`,
          `goal-${selection.websiteGoal}`,
          "professional-components-library",
          ...preset.visualStyle.uiPatterns,
        ]),
      ),
    },
    sections,
    componentPalette,
    componentPaths,
    layoutRules: Array.from(
      new Set([...selection.layoutRules, ...preset.layoutRules]),
    ),
    source: "professional-library",
  };

  const strategy = applyToStrategy(
    input.strategy,
    sections,
    input.ctaTypes,
  );
  const designSystem = applyToDesignSystem(
    input.designSystem,
    plan,
    input.designStyle,
  );

  return { plan, strategy, designSystem };
}
