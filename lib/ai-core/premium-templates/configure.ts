import { resolveWebsiteGoal } from "@/lib/ai-core/components/goals";
import type { WebsiteGoal } from "@/lib/ai-core/components/types";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { TemplateDesignPreset } from "@/lib/ai-core/templates/types";
import type {
  ConfiguredPremiumTemplate,
  PremiumContentStrategy,
  PremiumImageRequirement,
  PremiumTemplateDefinition,
  PremiumTemplatePage,
  PremiumTemplateSection,
} from "@/lib/ai-core/premium-templates/types";
import { sectionOrderForGoal } from "@/lib/ai-core/components/goals";

/**
 * Configure a premium template dynamically from audience, website goal, and brand style.
 * Templates stay AI-driven — page structure, sections, components, and images adapt.
 */
export function configurePremiumTemplate(params: {
  template: PremiumTemplateDefinition;
  websiteGoal?: string;
  businessGoals?: string[];
  positioning?: string;
  targetAudience?: string;
  brandStyle?: string;
  designStyle?: string;
  confidence?: number;
  reason?: string;
  source?: ConfiguredPremiumTemplate["source"];
}): ConfiguredPremiumTemplate {
  const template = params.template;
  const websiteGoal = resolveWebsiteGoal({
    websiteGoal: params.websiteGoal || template.defaultWebsiteGoal,
    businessGoals: params.businessGoals,
    positioning: params.positioning,
    ctaTypes: template.contentStrategy.ctaHierarchy,
    industryId: template.industryId,
  });

  const brandStyle = resolveBrandStyle(
    params.brandStyle || params.designStyle || template.designStyle,
    template,
  );
  const designPreset = resolveDesignPreset(brandStyle, template.designPreset);
  const designStyle =
    params.designStyle || `${brandStyle} · ${template.designStyle}`;

  const sections = adaptSections(template.sections, websiteGoal, brandStyle);
  const pageStructure = adaptPageStructure(
    template.pageStructure,
    websiteGoal,
    template.contentStrategy,
  );
  const recommendedComponents = adaptComponents(
    template.recommendedComponents,
    sections,
    brandStyle,
    websiteGoal,
  );
  const imageRequirements = adaptImageRequirements(
    template.imageRequirements,
    brandStyle,
    websiteGoal,
  );
  const contentStrategy = adaptContentStrategy(
    template.contentStrategy,
    params.targetAudience,
    brandStyle,
    websiteGoal,
  );
  const conversionPath =
    template.conversionPath?.length
      ? template.conversionPath
      : buildConversionPath(websiteGoal, sections, contentStrategy);

  return {
    template,
    websiteGoal,
    brandStyle,
    designPreset,
    designStyle,
    layoutStyle: template.layoutStyle,
    pageStructure,
    sections,
    recommendedComponents,
    imageRequirements,
    contentStrategy,
    conversionPath,
    layoutNotes: [
      `Premium template: ${template.name}`,
      `Goal-driven section order for ${websiteGoal}`,
      `Brand style: ${brandStyle} · preset: ${designPreset}`,
      `Pages: ${pageStructure.map((p) => p.name).join(" → ")}`,
      "Composable with Professional Components Library + Premium Design System",
    ],
    confidence: params.confidence ?? 0.82,
    reason:
      params.reason ||
      `Configured ${template.name} for goal=${websiteGoal}, style=${brandStyle}, audience=${params.targetAudience || contentStrategy.audienceNotes}`,
    source: params.source ?? "industry",
  };
}

function resolveBrandStyle(
  raw: string,
  template: PremiumTemplateDefinition,
): string {
  const v = raw.toLowerCase();
  for (const style of template.brandStyles) {
    if (v.includes(style.toLowerCase())) return style;
  }
  if (v.includes("luxury") || v.includes("editorial")) return "luxury";
  if (v.includes("minimal")) return "minimal";
  if (v.includes("corporate") || v.includes("trust") || v.includes("calm")) {
    return "corporate";
  }
  if (v.includes("tech") || v.includes("futur")) return "modern";
  if (v.includes("creative")) return "creative";
  if (v.includes("cinematic") || v.includes("travel")) return "cinematic";
  return template.brandStyles[0] || "modern";
}

function resolveDesignPreset(
  brandStyle: string,
  fallback: TemplateDesignPreset,
): TemplateDesignPreset {
  const v = brandStyle.toLowerCase();
  if (v.includes("luxury") || v.includes("editorial")) return "luxury";
  if (v.includes("minimal")) return "minimal";
  if (v.includes("corporate") || v.includes("trust") || v.includes("calm")) {
    return "corporate";
  }
  if (v.includes("tech") || v.includes("futur")) return "tech";
  if (v.includes("creative") || v.includes("bold")) return "creative";
  if (v.includes("modern") || v.includes("commercial") || v.includes("cinematic")) {
    return "modern";
  }
  return fallback;
}

function adaptSections(
  sections: PremiumTemplateSection[],
  goal: WebsiteGoal,
  brandStyle: string,
): PremiumTemplateSection[] {
  const goalKinds = sectionOrderForGoal(goal);
  const kindHints: Array<{ re: RegExp; kind: string }> = [
    { re: /hero/i, kind: "hero" },
    { re: /service|care|program/i, kind: "services" },
    { re: /feature|why|craft|capabilit/i, kind: "features" },
    {
      re: /product|vehicle|listing|tour|menu|collection|showcase|inventory/i,
      kind: "product-showcase",
    },
    { re: /gallery|destination|portfolio|atmosphere|campus/i, kind: "gallery" },
    { re: /testimonial|story|review/i, kind: "testimonials" },
    { re: /pric/i, kind: "pricing" },
    { re: /faq/i, kind: "faq" },
    { re: /book|reserv|appoint|admission/i, kind: "booking" },
    { re: /contact/i, kind: "contact" },
    { re: /map|location|branch/i, kind: "maps" },
    { re: /team|doctor|faculty|agent/i, kind: "team" },
    { re: /blog|insight|resource/i, kind: "blog" },
    { re: /cta/i, kind: "cta" },
  ];

  const scored = sections.map((section) => {
    const kind =
      kindHints.find((h) => h.re.test(section.label) || h.re.test(section.key))
        ?.kind || "features";
    const orderIdx = goalKinds.indexOf(kind as (typeof goalKinds)[number]);
    return {
      section: adaptSectionComponent(section, brandStyle, goal),
      order: orderIdx === -1 ? 50 + section.sortOrder : orderIdx,
    };
  });

  return scored
    .sort(
      (a, b) =>
        a.order - b.order || a.section.sortOrder - b.section.sortOrder,
    )
    .map((row, index) => ({
      ...row.section,
      sortOrder: (index + 1) * 10,
    }));
}

function adaptSectionComponent(
  section: PremiumTemplateSection,
  brandStyle: string,
  goal: WebsiteGoal,
): PremiumTemplateSection {
  let componentId = section.componentId;
  const style = brandStyle.toLowerCase();

  if (section.key === "hero" || /hero/i.test(section.label)) {
    if (style.includes("luxury") || style.includes("editorial")) {
      componentId = "HeroLuxury";
    } else if (style.includes("cinematic") || goal === "brand") {
      componentId = componentId === "HeroProduct" ? "HeroProduct" : "HeroVideo";
    } else if (
      style.includes("corporate") ||
      style.includes("trust") ||
      style.includes("calm")
    ) {
      componentId = "HeroSplit";
    } else if (goal === "conversion" || goal === "ecommerce") {
      componentId =
        componentId === "HeroProperty" ? "HeroProperty" : "HeroProduct";
    }
  }

  return { ...section, componentId };
}

/**
 * Adapt full sitemap by website goal — reorder pages, enrich keySections + CTAs.
 */
function adaptPageStructure(
  pages: PremiumTemplatePage[],
  goal: WebsiteGoal,
  content: PremiumContentStrategy,
): PremiumTemplatePage[] {
  const priority = pagePriorityForGoal(goal);
  const primaryCta = content.ctaHierarchy[0];

  const scored = pages.map((page) => {
    const blob = `${page.name} ${page.purpose} ${page.keySections.join(" ")}`.toLowerCase();
    let score = 0;
    for (let i = 0; i < priority.length; i += 1) {
      if (blob.includes(priority[i]!)) score += 100 - i * 8;
    }
    // Always keep Home first.
    if (page.path === "/" || page.name.toLowerCase() === "home") score += 1000;

    const keySections = enrichKeySections(page, goal);
    return {
      page: {
        ...page,
        keySections,
        primaryCta: page.primaryCta || primaryCta,
        purpose: adaptPagePurpose(page.purpose, goal),
      },
      score,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map((row) => row.page)
    .slice(0, goal === "content" || goal === "brand" ? 6 : 5);
}

function pagePriorityForGoal(goal: WebsiteGoal): string[] {
  switch (goal) {
    case "booking":
      return [
        "home",
        "book",
        "appoint",
        "reserv",
        "tour",
        "service",
        "doctor",
        "contact",
        "faq",
      ];
    case "ecommerce":
      return [
        "home",
        "shop",
        "product",
        "collection",
        "pricing",
        "cart",
        "contact",
      ];
    case "conversion":
      return ["home", "product", "pricing", "feature", "customer", "contact", "faq"];
    case "brand":
      return ["home", "about", "work", "portfolio", "gallery", "insight", "contact"];
    case "content":
      return ["home", "insight", "blog", "resource", "program", "about", "contact"];
    case "lead-gen":
    default:
      return ["home", "service", "about", "pricing", "insight", "contact", "faq"];
  }
}

function enrichKeySections(
  page: PremiumTemplatePage,
  goal: WebsiteGoal,
): string[] {
  const base = [...page.keySections];
  if (page.path === "/" || page.name.toLowerCase() === "home") {
    const extras =
      goal === "booking"
        ? ["Booking", "Testimonials"]
        : goal === "ecommerce"
          ? ["Product showcase", "Pricing"]
          : goal === "conversion"
            ? ["Features", "Pricing", "CTA"]
            : goal === "brand"
              ? ["Gallery", "Team"]
              : ["Services", "Contact"];
    for (const e of extras) {
      if (!base.some((b) => b.toLowerCase() === e.toLowerCase())) base.push(e);
    }
  }
  return Array.from(new Set(base)).slice(0, 6);
}

function adaptPagePurpose(purpose: string, goal: WebsiteGoal): string {
  const suffix =
    goal === "booking"
      ? " Optimized for booking conversions."
      : goal === "ecommerce"
        ? " Optimized for product discovery and purchase intent."
        : goal === "conversion"
          ? " Optimized for trial/demo conversion."
          : goal === "lead-gen"
            ? " Optimized for qualified lead capture."
            : "";
  if (purpose.includes("Optimized for")) return purpose;
  return `${purpose}${suffix}`.trim();
}

function adaptComponents(
  base: DesignRendererComponentId[],
  sections: PremiumTemplateSection[],
  brandStyle: string,
  goal: WebsiteGoal,
): DesignRendererComponentId[] {
  const style = brandStyle.toLowerCase();
  let nav: DesignRendererComponentId = "SiteHeader";
  if (
    style.includes("luxury") ||
    style.includes("cinematic") ||
    style.includes("editorial")
  ) {
    nav = "SiteHeaderTransparent";
  } else if (
    goal === "conversion" ||
    goal === "ecommerce" ||
    style.includes("tech") ||
    style.includes("modern")
  ) {
    nav = "NavModern";
  }

  const fromSections = sections.map((s) => s.componentId);
  return Array.from(
    new Set<DesignRendererComponentId>([
      nav,
      ...fromSections,
      "SiteFooter",
      ...base,
    ]),
  );
}

function adaptImageRequirements(
  requirements: PremiumImageRequirement[],
  brandStyle: string,
  goal: WebsiteGoal,
): PremiumImageRequirement[] {
  const styleNote =
    brandStyle.toLowerCase().includes("luxury")
      ? "luxury editorial lighting"
      : brandStyle.toLowerCase().includes("cinematic")
        ? "cinematic depth and atmosphere"
        : brandStyle.toLowerCase().includes("minimal")
          ? "clean minimal composition"
          : "premium commercial photography";

  const goalNote =
    goal === "ecommerce"
      ? "product-forward staging"
      : goal === "booking"
        ? "experience and hospitality cues"
        : goal === "conversion"
          ? "product UI / outcome clarity"
          : "brand-authentic scenes";

  return requirements.map((req) => ({
    ...req,
    brief: `${req.brief}. Style: ${styleNote}. Emphasis: ${goalNote}. No text overlays.`,
  }));
}

function adaptContentStrategy(
  base: PremiumContentStrategy,
  targetAudience: string | undefined,
  brandStyle: string,
  goal: WebsiteGoal,
): PremiumContentStrategy {
  const ctaHierarchy = [...base.ctaHierarchy];
  if (goal === "booking" && !ctaHierarchy.some((c) => /book|reserv|appoint/i.test(c))) {
    ctaHierarchy.unshift("Book now");
  }
  if (goal === "conversion" && !ctaHierarchy.some((c) => /trial|demo|start/i.test(c))) {
    ctaHierarchy.unshift("Start free trial");
  }
  if (goal === "lead-gen" && !ctaHierarchy.some((c) => /consult|contact|quote/i.test(c))) {
    ctaHierarchy.unshift("Request a consultation");
  }

  return {
    ...base,
    audienceNotes: targetAudience?.trim() || base.audienceNotes,
    brandVoice: adaptVoice(base.brandVoice, brandStyle),
    ctaHierarchy: Array.from(new Set(ctaHierarchy)).slice(0, 5),
    seoTopics: base.seoTopics,
  };
}

function buildConversionPath(
  goal: WebsiteGoal,
  sections: PremiumTemplateSection[],
  content: PremiumContentStrategy,
): string[] {
  const labels = sections.map((s) => s.label);
  const cta = content.ctaHierarchy[0] || "Get started";
  switch (goal) {
    case "booking":
      return ["Awareness", ...labels.slice(0, 3), "Booking", cta].slice(0, 6);
    case "ecommerce":
      return ["Discover", "Browse", "Consider", "Purchase", cta].slice(0, 6);
    case "conversion":
      return ["Value", "Features", "Proof", "Pricing", cta].slice(0, 6);
    default:
      return ["Attract", ...labels.slice(0, 2), "Trust", "Convert", cta].slice(
        0,
        6,
      );
  }
}

function adaptVoice(base: string, brandStyle: string): string {
  const style = brandStyle.toLowerCase();
  if (style.includes("luxury")) return `${base}; elevated luxury diction`;
  if (style.includes("minimal")) return `${base}; spare and precise`;
  if (style.includes("corporate")) return `${base}; formal and reassuring`;
  if (style.includes("cinematic")) return `${base}; vivid and atmospheric`;
  return base;
}
