import {
  getCatalogEntry,
  listCatalogByKind,
} from "@/lib/ai-core/components/catalog";
import {
  resolveWebsiteGoal,
  sectionOrderForGoal,
} from "@/lib/ai-core/components/goals";
import type {
  ComponentSelectionContext,
  ComponentSelectionResult,
  HeroVariant,
  NavVariant,
  ProfessionalComponentDefinition,
  SectionKind,
  SelectedHomeSection,
  WebsiteGoal,
} from "@/lib/ai-core/components/types";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";

type HomeSectionKind = Exclude<SectionKind, "header" | "footer">;

const REQUIRED_TO_KIND: Array<{ re: RegExp; kind: HomeSectionKind }> = [
  { re: /hero/i, kind: "hero" },
  { re: /feature storytelling|narrative|chapter/i, kind: "feature-story" },
  { re: /interactive product|product stage|showroom experience/i, kind: "interactive-product" },
  { re: /case stud/i, kind: "case-studies" },
  { re: /brand trust|credibility|logo cloud|logo rhythm/i, kind: "brand-trust" },
  { re: /timeline|process|journey/i, kind: "timeline" },
  { re: /comparison|compare|versus|\bvs\b/i, kind: "comparison" },
  { re: /video|film|watch the/i, kind: "video" },
  { re: /gallery experience|atmosphere gallery/i, kind: "gallery-experience" },
  { re: /service|care|offer/i, kind: "services" },
  { re: /feature|why|benefit|highlight|capabilit/i, kind: "features" },
  {
    re: /product|showcase|vehicle|package|tour|menu|collection/i,
    kind: "product-showcase",
  },
  { re: /gallery|destination|portfolio|visual/i, kind: "gallery" },
  { re: /testimonial|review|proof|social/i, kind: "testimonials" },
  { re: /pric|plan|package|tier/i, kind: "pricing" },
  { re: /faq|question/i, kind: "faq" },
  { re: /book|reserv|appoint|schedule/i, kind: "booking" },
  { re: /contact|inquiry|reach/i, kind: "contact" },
  { re: /map|location|branch|find us|address/i, kind: "maps" },
  { re: /team|doctor|staff|expert|people/i, kind: "team" },
  { re: /blog|insight|article|news|resource/i, kind: "blog" },
  { re: /cta|get started/i, kind: "cta" },
];

function normalizeBlob(...parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function scoreCandidate(
  candidate: ProfessionalComponentDefinition,
  ctx: ComponentSelectionContext,
  kind: SectionKind,
  websiteGoal: WebsiteGoal,
): number {
  let score = 0;
  const styleBlob = normalizeBlob(
    ctx.designStyle,
    ctx.stylePreset,
    ctx.layoutStyle,
    ctx.premiumHeroStyle,
    ctx.premiumSectionLayout,
  );
  const audienceBlob = normalizeBlob(ctx.targetAudience, ctx.businessType);
  const requiredBlob = normalizeBlob(...ctx.requiredSections);
  const goalBlob = normalizeBlob(
    websiteGoal,
    ...(ctx.businessGoals ?? []),
    ctx.positioning,
  );

  if (
    candidate.industries.includes("*") ||
    candidate.industries.includes(ctx.industryId)
  ) {
    score += candidate.industries.includes(ctx.industryId) ? 40 : 10;
  } else {
    score -= 20;
  }

  for (const style of candidate.designStyles) {
    if (style === "*") {
      score += 5;
      continue;
    }
    if (styleBlob.includes(style.toLowerCase())) score += 18;
  }

  for (const aud of candidate.audiences) {
    if (aud === "*") {
      score += 3;
      continue;
    }
    if (audienceBlob.includes(aud.toLowerCase())) score += 14;
  }

  for (const goal of candidate.websiteGoals) {
    if (goal === "*") {
      score += 4;
      continue;
    }
    if (goal === websiteGoal) score += 28;
    if (goalBlob.includes(goal)) score += 10;
  }

  for (const kw of candidate.sectionKeywords) {
    if (requiredBlob.includes(kw.toLowerCase())) score += 12;
  }

  if (kind === "hero" && candidate.variant) {
    const heroStyle = normalizeBlob(ctx.premiumHeroStyle, ctx.designStyle);
    if (candidate.variant === "luxury" && /luxury|editorial|premium/.test(heroStyle)) {
      score += 25;
    }
    if (candidate.variant === "video" && /video|cinematic|immersive/.test(heroStyle)) {
      score += 22;
    }
    if (candidate.variant === "split" && /split|corporate|product/.test(heroStyle)) {
      score += 22;
    }
    if (candidate.variant === "product" && /product|saas|tech/.test(heroStyle)) {
      score += 22;
    }
    if (candidate.variant === "image" && /image|full-bleed|cinematic/.test(heroStyle)) {
      score += 16;
    }
  }

  if (ctx.industryId === "automotive" && candidate.id === "HeroLuxuryShowcase") {
    score += 30;
  }
  if (ctx.industryId === "real-estate" && candidate.id === "HeroProperty") {
    score += 30;
  }
  if (ctx.industryId === "saas" && candidate.id === "HeroProduct") {
    score += 28;
  }
  if (ctx.industryId === "tourism" && candidate.id === "DestinationsGallery") {
    score += 20;
  }

  // Prefer "modern" library variants for conversion/ecommerce goals.
  if (
    (websiteGoal === "conversion" || websiteGoal === "ecommerce") &&
    /Modern|NavModern|PricingModern|CtaSplit|Portfolio/.test(candidate.id)
  ) {
    score += 12;
  }

  return score;
}

function pickBest(
  kind: SectionKind,
  ctx: ComponentSelectionContext,
  websiteGoal: WebsiteGoal,
): ProfessionalComponentDefinition | null {
  const candidates = listCatalogByKind(kind);
  if (!candidates.length) return null;
  let best = candidates[0]!;
  let bestScore = -Infinity;
  for (const candidate of candidates) {
    const score = scoreCandidate(candidate, ctx, kind, websiteGoal);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return bestScore < 0
    ? (candidates.find((c) => c.industries.includes("*")) ?? best)
    : best;
}

function resolveHomeKinds(
  ctx: ComponentSelectionContext,
  websiteGoal: WebsiteGoal,
): HomeSectionKind[] {
  const fromRequired: HomeSectionKind[] = [];
  for (const label of ctx.requiredSections) {
    for (const rule of REQUIRED_TO_KIND) {
      if (rule.re.test(label) && !fromRequired.includes(rule.kind)) {
        fromRequired.push(rule.kind);
      }
    }
  }

  const goalOrder = sectionOrderForGoal(websiteGoal);
  const industryExtras: HomeSectionKind[] = [];
  if (["tourism", "restaurant", "agency", "real-estate"].includes(ctx.industryId)) {
    industryExtras.push("gallery-experience");
  }
  if (["agency", "saas", "technology", "business"].includes(ctx.industryId)) {
    industryExtras.push("case-studies");
  }
  if (["clinic", "restaurant", "tourism", "education"].includes(ctx.industryId)) {
    industryExtras.push("booking");
  }
  if (["restaurant", "clinic", "automotive", "education"].includes(ctx.industryId)) {
    industryExtras.push("maps");
  }

  const merged = new Set<HomeSectionKind>([
    ...goalOrder.slice(0, 9),
    ...fromRequired,
    ...industryExtras,
  ]);

  // Preserve goal-first ordering.
  return goalOrder.filter((k) => merged.has(k)).slice(0, 10);
}

function sectionTitle(
  kind: SectionKind,
  pick: ProfessionalComponentDefinition,
): string {
  switch (kind) {
    case "hero":
      return "Hero";
    case "services":
      return "Services";
    case "features":
      return "Features";
    case "feature-story":
      return "Feature storytelling";
    case "product-showcase":
      return "Product showcase";
    case "interactive-product":
      return "Interactive product showcase";
    case "gallery":
      return "Gallery";
    case "gallery-experience":
      return "Gallery experience";
    case "case-studies":
      return "Case studies";
    case "brand-trust":
      return "Brand trust";
    case "timeline":
      return "Timeline";
    case "comparison":
      return "Comparison";
    case "video":
      return "Video";
    case "testimonials":
      return "Testimonials";
    case "pricing":
      return "Pricing";
    case "faq":
      return "FAQ";
    case "booking":
      return "Booking";
    case "contact":
      return "Contact";
    case "maps":
      return "Locations";
    case "team":
      return "Team";
    case "blog":
      return "Insights";
    case "cta":
      return "Get started";
    default:
      return pick.exportName;
  }
}

function pickNav(
  ctx: ComponentSelectionContext,
  websiteGoal: WebsiteGoal,
  heroVariant: HeroVariant,
): ProfessionalComponentDefinition {
  const headers = listCatalogByKind("header");
  let best = headers.find((h) => h.id === "SiteHeader") ?? headers[0]!;
  let bestScore = -Infinity;
  for (const candidate of headers) {
    let score = scoreCandidate(candidate, ctx, "header", websiteGoal);
    if (
      (heroVariant === "luxury" ||
        heroVariant === "video" ||
        heroVariant === "image" ||
        heroVariant === "cinematic" ||
        heroVariant === "full-image") &&
      candidate.variant === "transparent"
    ) {
      score += 20;
    }
    if (heroVariant === "interactive" && candidate.variant === "modern") {
      score += 16;
    }
    if (
      (websiteGoal === "conversion" || websiteGoal === "ecommerce") &&
      candidate.variant === "modern"
    ) {
      score += 18;
    }
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

/**
 * AI component selection intelligence — picks premium components using
 * industry, business type, audience, website goal, and design style.
 */
export function selectProfessionalComponents(
  ctx: ComponentSelectionContext,
): ComponentSelectionResult {
  const websiteGoal = resolveWebsiteGoal({
    websiteGoal: ctx.websiteGoal,
    businessGoals: ctx.businessGoals,
    positioning: ctx.positioning,
    ctaTypes: ctx.ctaTypes,
    industryId: ctx.industryId,
  });

  const kinds = resolveHomeKinds(ctx, websiteGoal);
  const homeSections: SelectedHomeSection[] = [];
  let heroVariant: HeroVariant = "image";

  for (const kind of kinds) {
    const pick = pickBest(kind, ctx, websiteGoal);
    if (!pick) continue;
    if (kind === "hero" && pick.variant) {
      heroVariant = pick.variant as HeroVariant;
    }
    homeSections.push({
      name: sectionTitle(kind, pick),
      kind,
      componentId: pick.id,
      goal: pick.defaultGoal,
      contentNotes: [
        pick.description,
        `Library: Professional Components · ${pick.kind}${pick.variant ? `/${pick.variant}` : ""}`,
        `Website goal: ${websiteGoal}`,
        ctx.designStyle ? `Design style: ${ctx.designStyle}` : "",
        ctx.targetAudience ? `Audience: ${ctx.targetAudience}` : "",
        ctx.businessType ? `Business: ${ctx.businessType}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      assetRole: pick.assetRole,
    });
  }

  if (!homeSections.some((s) => s.kind === "hero")) {
    const hero = pickBest("hero", ctx, websiteGoal)!;
    heroVariant = (hero.variant as HeroVariant) || "image";
    homeSections.unshift({
      name: "Hero",
      kind: "hero",
      componentId: hero.id,
      goal: hero.defaultGoal,
      contentNotes: hero.description,
      assetRole: "hero",
    });
  }

  const nav = pickNav(ctx, websiteGoal, heroVariant);
  const navVariant = (nav.variant as NavVariant) || "sticky";
  const footer =
    pickBest("footer", ctx, websiteGoal) ?? getCatalogEntry("SiteFooter")!;

  const palette: DesignRendererComponentId[] = [
    nav.id,
    ...homeSections.map((s) => s.componentId),
    footer.id,
  ];

  const paths = Array.from(
    new Set(
      palette
        .map((id) => getCatalogEntry(id)?.path)
        .filter((p): p is string => Boolean(p)),
    ),
  );

  return {
    heroVariant,
    navVariant,
    websiteGoal,
    homeSections,
    componentPalette: Array.from(new Set(palette)),
    componentPaths: paths,
    layoutRules: [
      `Professional Components Library: ${navVariant} nav · ${heroVariant} hero`,
      `Website goal: ${websiteGoal} — section order optimized for conversion path`,
      "Compose page from concrete section components — never generic placeholders",
      "Use Premium Design System CSS variables for color, type, space, glass, motion",
      "Mobile-first responsive layouts with touch-friendly CTAs and stacked grids",
      "Subtle entrance motion (fadeUp) — never distracting animation",
      ctx.designStyle
        ? `Honor design style: ${ctx.designStyle}`
        : "Honor selected design style",
    ],
    reason: `Selected ${homeSections.length} sections for ${ctx.industryId} · goal=${websiteGoal} · ${heroVariant} hero · ${navVariant} nav`,
  };
}
