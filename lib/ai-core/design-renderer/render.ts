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
import {
  resolveInnerPageSections,
  resolveSectionShellVariantFromSpec,
  type CompositionMode,
} from "@/lib/ai-core/website-builder/excellence";

function resolveIndustryId(input: DesignRendererInput): IndustryId {
  const raw = String(input.industryId || "").trim().toLowerCase();
  if (raw && isIndustryId(raw)) return raw;

  const label = String(input.industryLabel || "").toLowerCase();
  if (label.includes("tour") || label.includes("travel")) return "tourism";
  if (label.includes("auto") && !label.includes("automatic")) return "automotive";
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
  if (
    label.includes("furniture") ||
    label.includes("furnish") ||
    label.includes("sofa") ||
    label.includes("showroom")
  ) {
    return "furniture";
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
  options?: {
    industryId?: IndustryId;
    compositionMode?: CompositionMode;
    heroTreatment?: string;
  },
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

    // Intelligence-driven inner page sections (not generic FeatureHighlights defaults).
    const innerCtx = {
      industryId: options?.industryId,
      compositionMode: options?.compositionMode,
      heroTreatment: options?.heroTreatment,
      pagePurpose: page.purpose,
    };
    const resolved = resolveInnerPageSections(page, websiteSections, innerCtx);
    for (const section of resolved) {
      out.push(toRenderedSection(section, page.name, cursor));
      cursor += 1;
    }
  }

  return out;
}

function uniqueOrdered(ids: DesignRendererComponentId[]): DesignRendererComponentId[] {
  const seen = new Set<DesignRendererComponentId>();
  const out: DesignRendererComponentId[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

const NAV_IDS = new Set<DesignRendererComponentId>([
  "SiteHeader",
  "SiteHeaderTransparent",
  "NavModern",
]);

function resolveNavComponent(
  order: DesignRendererComponentId[],
): DesignRendererComponentId {
  return order.find((id) => NAV_IDS.has(id)) ?? "SiteHeader";
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
  designSystemSpec?: DesignRendererInput["designSystemSpec"],
): CoreDesignSystem {
  const palette = plan.componentPalette.map(String);
  const premiumLayout = designSystem.premium?.layout;
  const specComponentStyle = designSystemSpec?.componentStyling;
  const specSpacing = designSystemSpec?.spacing;
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
        ...(plan.sectionShellVariant
          ? [`section-shell:${plan.sectionShellVariant}`]
          : []),
        ...(plan.compositionMode ? [`composition:${plan.compositionMode}`] : []),
      ]),
    ).slice(0, 16),
    componentPalette: plan.homeComponentOrder?.length
      ? plan.homeComponentOrder.map(String)
      : Array.from(
          new Set([...palette, ...(designSystem.componentPalette ?? [])]),
        ).slice(0, 24),
    homeComponentOrder: plan.homeComponentOrder?.map(String),
    sectionShellVariant: plan.sectionShellVariant,
    compositionMode: plan.compositionMode,
    componentStyle: specComponentStyle
      ? {
          buttons: specComponentStyle.buttons,
          cards: specComponentStyle.cards,
          inputs: specComponentStyle.forms,
          navigation: specComponentStyle.navigation,
          palette: designSystem.componentStyle?.palette ?? palette.slice(0, 6),
        }
      : designSystem.componentStyle,
    uiStyle: specSpacing
      ? {
          density: specSpacing.density,
          corners: designSystem.uiStyle?.corners ?? "soft",
          elevation: designSystem.uiStyle?.elevation ?? "soft",
          contrast: designSystem.uiStyle?.contrast ?? "medium",
          notes: specSpacing.notes,
        }
      : designSystem.uiStyle,
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

  const compositionMode =
    input.compositionMode ??
    (input.designSystemSpec?.layoutComposition.compositionMode as
      | CompositionMode
      | undefined) ??
    "balanced";
  const sectionShellVariant = resolveSectionShellVariantFromSpec(
    input.designSystemSpec,
  );

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
    compositionMode,
    componentStyling: input.designSystemSpec?.componentStyling,
    brandName: input.brandName,
    language: input.language,
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
    {
      industryId,
      compositionMode,
      heroTreatment:
        input.premiumHeroStyle ||
        input.designSystem.premium?.layout?.heroStyle,
    },
  );
  const nonHome = presetSections.filter((s) => s.page !== homeName);
  const sections = [...intelligentHome, ...nonHome];

  const dnaDriven = Boolean(
    premiumHome && (input.premiumComponentOrder?.length || input.premiumHomeSections?.length),
  );

  let componentPalette: DesignRendererComponentId[];
  let homeComponentOrder: DesignRendererComponentId[] | undefined;

  if (dnaDriven && input.premiumComponentOrder?.length) {
    homeComponentOrder = uniqueOrdered(input.premiumComponentOrder);
    componentPalette = uniqueOrdered([
      ...homeComponentOrder,
      ...nonHome.map((s) => s.componentId),
    ]);
  } else if (dnaDriven && premiumHome) {
    const nav = resolveNavComponent(
      intelligentHome.map((s) => s.componentId),
    );
    homeComponentOrder = uniqueOrdered([
      nav,
      ...intelligentHome.map((s) => s.componentId),
      "SiteFooter",
    ]);
    componentPalette = uniqueOrdered([
      ...homeComponentOrder,
      ...nonHome.map((s) => s.componentId),
    ]);
  } else {
    componentPalette = uniqueOrdered([
      ...(input.premiumRecommendedComponents ?? []),
      ...selection.componentPalette,
      ...sections.map((s) => s.componentId),
    ]);
    const hasNav = componentPalette.some((id) => NAV_IDS.has(id));
    if (!hasNav) componentPalette.unshift("SiteHeader");
    if (!componentPalette.includes("SiteFooter")) {
      componentPalette.push("SiteFooter");
    }
  }

  if (dnaDriven) {
    const hasNav = componentPalette.some((id) => NAV_IDS.has(id));
    if (!hasNav) {
      componentPalette.unshift("SiteHeader");
      homeComponentOrder?.unshift("SiteHeader");
    }
    if (!componentPalette.includes("SiteFooter")) {
      componentPalette.push("SiteFooter");
      homeComponentOrder?.push("SiteFooter");
    }
  }

  const componentPaths = Array.from(
    new Set([
      "components/ui/section-shell.tsx",
      "components/ui/motion.tsx",
      ...(dnaDriven ? [] : selection.componentPaths),
      ...sections.map((s) => s.componentPath),
    ]),
  );

  const plan: DesignRenderPlan = {
    industryId,
    industryLabel: preset.label,
    layoutStyle: preset.layoutStyle,
    visualStyle: dnaDriven
      ? {
          ...preset.visualStyle,
          heroTreatment:
            input.premiumHeroStyle ||
            input.designSystem.premium?.layout?.heroStyle ||
            preset.visualStyle.heroTreatment,
          cardTreatment:
            input.designSystem.premium?.layout?.cardStyle ||
            preset.visualStyle.cardTreatment,
          uiPatterns: Array.from(
            new Set([
              input.premiumHeroStyle || "dna-hero",
              input.premiumSectionLayout || "dna-sections",
              "template-dna-driven",
              ...preset.visualStyle.uiPatterns,
            ]),
          ),
        }
      : {
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
    homeComponentOrder,
    componentPaths,
    layoutRules: dnaDriven
      ? [
          "Template DNA drives home section order and component selection",
          "Do not substitute industry-default components on the home page",
        ]
      : Array.from(
          new Set([...selection.layoutRules, ...preset.layoutRules]),
        ),
    source: dnaDriven ? "merged" : "professional-library",
    sectionShellVariant,
    compositionMode,
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
    input.designSystemSpec,
  );

  return { plan, strategy, designSystem };
}
