/**
 * AI Design Critic — post-generation visual/UX audit (heuristic art direction).
 */

import type {
  DesignCriticFinding,
  DesignCriticReport,
} from "@/lib/ai-core/design-critic/types";

export type DesignCriticFile = { path: string; content: string };

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function allContent(files: DesignCriticFile[]): string {
  return files.map((f) => f.content).join("\n");
}

/**
 * Review generated website files for premium design quality.
 */
export function analyzeDesignCritic(params: {
  files: DesignCriticFile[];
}): DesignCriticReport {
  const content = allContent(params.files);
  const findings: DesignCriticFinding[] = [];
  let score = 88;
  let premiumFeel = 86;
  const weakSections: string[] = [];
  let n = 0;
  const id = (area: string) => `design-critic-${area}-${++n}`;

  const h1 = (content.match(/<h1\b/gi) || []).length;
  if (h1 === 0) {
    findings.push({
      id: id("hierarchy"),
      area: "hierarchy",
      severity: "critical",
      title: "Missing H1 — weak visual hierarchy",
      detail: "A premium page leads with one decisive H1.",
      action: "Add a single keyword-rich H1 in the hero.",
    });
    score -= 14;
    premiumFeel -= 12;
    weakSections.push("Hero");
  } else if (h1 > 2) {
    findings.push({
      id: id("hierarchy-multi"),
      area: "hierarchy",
      severity: "major",
      title: "Multiple H1s dilute hierarchy",
      detail: `Found ${h1} H1 headings.`,
      action: "Keep one H1; demote others to H2.",
    });
    score -= 8;
    premiumFeel -= 6;
  }

  if (!/py-16|py-20|section-y|py-\[var\(--section/i.test(content)) {
    findings.push({
      id: id("spacing"),
      area: "spacing",
      severity: "major",
      title: "Section spacing feels tight or inconsistent",
      detail: "Premium sites use generous vertical rhythm.",
      action: "Apply SectionShell / --section-y spacing tokens to major bands.",
    });
    score -= 8;
    premiumFeel -= 10;
  }

  if (!/font-\[family-name:var\(--font|font-display|font-heading|Playfair|Cormorant|Space Grotesk|Manrope/i.test(
    content,
  )) {
    findings.push({
      id: id("type"),
      area: "typography",
      severity: "major",
      title: "Typography lacks premium display identity",
      detail: "Generic type stacks read as template UI.",
      action: "Wire display/heading fonts from the premium design system.",
    });
    score -= 10;
    premiumFeel -= 12;
  }

  if (!/animate-\[fadeUp|Motion|motion-safe|scaleIn|slowReveal/i.test(content)) {
    findings.push({
      id: id("motion"),
      area: "motion",
      severity: "minor",
      title: "Little intentional motion detected",
      detail: "Agency sites use 2–3 purposeful entrance motions.",
      action: "Wrap hero and section headers with Motion variants.",
    });
    score -= 5;
    premiumFeel -= 6;
  }

  if (!/\b(sm|md|lg):/.test(content)) {
    findings.push({
      id: id("mobile"),
      area: "mobile",
      severity: "critical",
      title: "Weak responsive breakpoint coverage",
      detail: "Mobile experience will feel desktop-stretched.",
      action: "Add sm/md/lg layout adjustments for hero, nav, and grids.",
    });
    score -= 12;
    premiumFeel -= 10;
    weakSections.push("Mobile layout");
  }

  const imgCount = (content.match(/<Image\b|<img\b|HERO_IMAGE|background-image/gi) || [])
    .length;
  if (imgCount < 2) {
    findings.push({
      id: id("imagery"),
      area: "imagery",
      severity: "major",
      title: "Sparse imagery — site may feel empty",
      detail: "Premium brand sites lead with strong photography.",
      action: "Ensure hero + at least one section media asset are wired.",
    });
    score -= 10;
    premiumFeel -= 14;
    weakSections.push("Imagery");
  }

  if (/placeholder|placehold\.co|via\.placeholder|picsum|dummyimage/i.test(content)) {
    findings.push({
      id: id("placeholder"),
      area: "imagery",
      severity: "critical",
      title: "Placeholder imagery still present",
      detail: "Placeholder URLs destroy premium perception.",
      action: "Replace with AI or curated stock photography URLs.",
    });
    score -= 16;
    premiumFeel -= 20;
  }

  if (/Lorem ipsum|TODO|Coming soon|Sample text/i.test(content)) {
    findings.push({
      id: id("ux-copy"),
      area: "ux",
      severity: "major",
      title: "Placeholder copy detected",
      detail: "Dummy copy breaks trust instantly.",
      action: "Replace with industry-specific headlines and service blurbs.",
    });
    score -= 10;
    premiumFeel -= 10;
    weakSections.push("Content");
  }

  if (!/cta|Get started|Book|Shop|Reserve|Contact|Demo|Explore/i.test(content)) {
    findings.push({
      id: id("ux-cta"),
      area: "ux",
      severity: "major",
      title: "Primary CTA presence is weak",
      detail: "Premium UX always offers a clear next step.",
      action: "Place a decisive primary CTA in the hero and a closing band.",
    });
    score -= 8;
  }

  // Soft uniqueness signal — repeated generic labels
  const genericHits = (
    content.match(/Our Services|Our Features|Welcome to|Click here/gi) || []
  ).length;
  if (genericHits >= 4) {
    findings.push({
      id: id("premium"),
      area: "premium-feel",
      severity: "opportunity",
      title: "Copy still feels template-generic",
      detail: `Repeated generic phrases (${genericHits}).`,
      action: "Rewrite section titles with brand-specific language.",
    });
    premiumFeel -= 8;
    score -= 4;
  }

  // Generic layout / weak composition
  const identicalCardGrids = (
    content.match(/grid gap-5 md:grid-cols-3|grid gap-6 lg:grid-cols-3/gi) || []
  ).length;
  if (identicalCardGrids >= 3) {
    findings.push({
      id: id("layout-generic"),
      area: "layout",
      severity: "major",
      title: "Generic repeated card-grid layout",
      detail: "Same 3-column card pattern repeated — feels templated.",
      action: "Vary composition: storytelling bands, asymmetric splits, full-bleed media.",
    });
    score -= 8;
    premiumFeel -= 10;
    weakSections.push("Layout composition");
  }

  if (
    !/object-cover|aspect-\[|aspect-video|min-h-\[70|min-h-screen|h-\[min/i.test(
      content,
    ) &&
    imgCount >= 1
  ) {
    findings.push({
      id: id("composition"),
      area: "imagery",
      severity: "minor",
      title: "Image composition lacks cinematic framing",
      detail: "Photos may sit as small cards instead of editorial planes.",
      action: "Use full-bleed / large aspect media treatments in hero and stories.",
    });
    premiumFeel -= 6;
    score -= 4;
  }

  if (!/TESTIMONIAL_IMAGES|Testimonials|BrandTrust/i.test(content)) {
    findings.push({
      id: id("missing-proof-visual"),
      area: "imagery",
      severity: "major",
      title: "Missing proof / testimonial visuals",
      detail: "Trust sections without imagery feel unfinished.",
      action: "Add testimonial portraits or brand-trust visual rhythm.",
    });
    score -= 7;
    premiumFeel -= 8;
    weakSections.push("Testimonials");
  }

  score = clamp(score);
  premiumFeel = clamp(premiumFeel);

  const improveThemes = [
    ...findings
      .filter((f) => f.severity === "critical" || f.severity === "major")
      .map((f) => f.action),
    "Increase premium feel: stronger hero photography, calmer spacing, decisive type",
    "Tighten mobile hierarchy: one column, larger tap CTAs, readable body",
  ].slice(0, 8);

  const designReady = score >= 70 && premiumFeel >= 68 && !findings.some((f) => f.severity === "critical");

  return {
    score,
    premiumFeel,
    findings,
    improveThemes: Array.from(new Set(improveThemes)),
    weakSections: Array.from(new Set(weakSections)),
    summary: `Design Critic score ${score} · premium feel ${premiumFeel}${
      designReady ? " — agency-ready" : " — polish before publish"
    }.`,
    designReady,
    generatedAt: new Date().toISOString(),
  };
}
