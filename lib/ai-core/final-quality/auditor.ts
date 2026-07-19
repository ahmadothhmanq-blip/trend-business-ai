/**
 * AI Website Quality Auditor — visual, layout, type, spacing, mobile, journey.
 */

import type {
  FinalQualityAuditorReport,
  FinalQualityFinding,
} from "@/lib/ai-core/final-quality/types";

export type AuditorFile = { path: string; content: string };

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function allContent(files: AuditorFile[]): string {
  return files.map((f) => f.content).join("\n");
}

/**
 * Professional design + UX audit before publish.
 */
export function runWebsiteQualityAuditor(params: {
  files: AuditorFile[];
}): FinalQualityAuditorReport {
  const content = allContent(params.files);
  const findings: FinalQualityFinding[] = [];
  let n = 0;
  const id = (dim: string) => `auditor-${dim}-${++n}`;

  const dims = {
    visual: 88,
    layout: 86,
    typography: 86,
    spacing: 86,
    mobile: 86,
    journey: 84,
  };

  // Visual quality
  const imgSignals = (
    content.match(
      /HERO_IMAGE|PRODUCT_IMAGE|GALLERY_IMAGES|SECTION_IMAGES|TESTIMONIAL_IMAGES|<img\b|<Image\b|resolveSiteImage/gi,
    ) || []
  ).length;
  if (imgSignals < 4) {
    findings.push({
      id: id("visual"),
      dimension: "visual",
      severity: "major",
      title: "Visual coverage is thin",
      detail: "Agency sites need photography across hero, services, and proof.",
      action: "Wire premium images into hero, services, gallery, and testimonials.",
      source: "auditor",
    });
    dims.visual -= 14;
  }
  if (/placehold\.co|via\.placeholder|picsum\.photos|dummyimage|data:image\/svg/i.test(content)) {
    findings.push({
      id: id("visual-ph"),
      dimension: "visual",
      severity: "critical",
      title: "Placeholder or SVG fallback visuals present",
      detail: "Generic placeholders fail professional review.",
      action: "Replace placeholders with AI or premium stock photography.",
      source: "auditor",
    });
    dims.visual -= 20;
  }

  // Layout balance
  const gridHits = (content.match(/grid-cols-|lg:grid-cols|md:grid-cols/gi) || []).length;
  const fullBleed = /min-h-\[|h-\[min\(100|full-bleed|HeroFull|HeroCinematic|bg-cover/i.test(
    content,
  );
  if (!fullBleed && gridHits < 2) {
    findings.push({
      id: id("layout"),
      dimension: "layout",
      severity: "major",
      title: "Layout feels flat / card-grid heavy",
      detail: "Weak layout balance — missing cinematic or editorial structure.",
      action: "Use a premium hero treatment and vary section layouts.",
      source: "auditor",
    });
    dims.layout -= 12;
  }
  if ((content.match(/rounded-\[var\(--radius|shadow-\[var\(--shadow|border border-/gi) || []).length > 28) {
    findings.push({
      id: id("layout-cards"),
      dimension: "layout",
      severity: "minor",
      title: "Possible card-grid overuse",
      detail: "Too many bordered cards can feel template-like.",
      action: "Replace some card grids with storytelling or full-bleed bands.",
      source: "auditor",
    });
    dims.layout -= 6;
  }

  // Typography
  if (!/font-\[family-name:var\(--font|--font-display|--font-heading|Playfair|Cormorant|Space Grotesk|Manrope|Satoshi/i.test(
    content,
  )) {
    findings.push({
      id: id("type"),
      dimension: "typography",
      severity: "major",
      title: "Typography lacks brand display identity",
      detail: "Default stacks read as generic SaaS UI.",
      action: "Apply Brand Identity / Design Plan display + heading fonts.",
      source: "auditor",
    });
    dims.typography -= 14;
  }
  const h1 = (content.match(/<h1\b/gi) || []).length;
  if (h1 !== 1) {
    findings.push({
      id: id("type-h1"),
      dimension: "typography",
      severity: h1 === 0 ? "critical" : "major",
      title: h1 === 0 ? "Missing H1 hierarchy" : "Multiple H1s weaken hierarchy",
      detail: `Found ${h1} H1 heading(s).`,
      action: "Keep exactly one decisive H1 in the hero.",
      source: "auditor",
    });
    dims.typography -= h1 === 0 ? 16 : 8;
  }

  // Spacing
  if (!/py-16|py-20|py-24|section-y|--section-y|SectionShell/i.test(content)) {
    findings.push({
      id: id("spacing"),
      dimension: "spacing",
      severity: "major",
      title: "Inconsistent section spacing",
      detail: "Tight or uneven rhythm hurts premium feel.",
      action: "Use SectionShell / spacing tokens for generous vertical rhythm.",
      source: "auditor",
    });
    dims.spacing -= 12;
  }

  // Mobile
  if (!/\b(sm|md|lg):/.test(content)) {
    findings.push({
      id: id("mobile"),
      dimension: "mobile",
      severity: "critical",
      title: "Weak mobile responsive coverage",
      detail: "Desktop-only layouts fail mobile experience review.",
      action: "Add sm/md/lg breakpoints for nav, hero, and grids.",
      source: "auditor",
    });
    dims.mobile -= 18;
  }
  if (!/min-h-11|min-h-12|py-3|touch|tap/i.test(content) && /href=.*#contact|Get started|Book/i.test(content)) {
    // soft — only nudge
    dims.mobile -= 2;
  }

  // User journey
  const hasHero = /Hero|hero|id=["']hero/i.test(content);
  const hasTrust = /Testimonial|BrandTrust|trust|proof|case.?stud/i.test(content);
  const hasContact = /#contact|ContactForm|ContactSection|mailto:/i.test(content);
  const hasCta = /Get started|Book|Contact|Demo|Shop|Reserve|Start|Talk/i.test(content);
  let journeyScore = 70;
  if (hasHero) journeyScore += 8;
  if (hasTrust) journeyScore += 8;
  if (hasContact) journeyScore += 8;
  if (hasCta) journeyScore += 6;
  dims.journey = clamp(journeyScore);
  if (!hasTrust) {
    findings.push({
      id: id("journey-trust"),
      dimension: "journey",
      severity: "major",
      title: "Trust / proof missing from journey",
      detail: "Users need social proof before the ask.",
      action: "Add testimonials, brand trust, or case studies before contact.",
      source: "auditor",
    });
  }
  if (!hasContact) {
    findings.push({
      id: id("journey-contact"),
      dimension: "journey",
      severity: "critical",
      title: "Contact / conversion endpoint missing",
      detail: "Journey has no clear end destination.",
      action: "Add a contact form or booking CTA section.",
      source: "auditor",
    });
    dims.journey -= 12;
  }

  const score = clamp(
    dims.visual * 0.22 +
      dims.layout * 0.18 +
      dims.typography * 0.16 +
      dims.spacing * 0.14 +
      dims.mobile * 0.16 +
      dims.journey * 0.14,
  );

  for (const k of Object.keys(dims) as (keyof typeof dims)[]) {
    dims[k] = clamp(dims[k]);
  }

  return {
    score,
    findings,
    dimensions: dims,
    summary: `Quality Auditor ${score}/100 — visual ${dims.visual}, layout ${dims.layout}, mobile ${dims.mobile}, journey ${dims.journey}`,
  };
}
