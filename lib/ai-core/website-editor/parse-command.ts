/**
 * Parse natural-language edit requests into structured WebsiteEditAction[].
 */

import type {
  WebsiteEditAction,
  WebsiteEditActionType,
} from "@/lib/ai-core/website-editor/types";
import type { WebsiteUnderstanding } from "@/lib/ai-core/website-editor/types";

const SECTION_ALIASES: Array<{ re: RegExp; kind: string; componentId: string }> = [
  { re: /case stud/i, kind: "case-studies", componentId: "CaseStudies" },
  { re: /brand trust|trust|social proof|logo/i, kind: "brand-trust", componentId: "BrandTrust" },
  { re: /timeline|process/i, kind: "timeline", componentId: "TimelineSection" },
  { re: /compar/i, kind: "comparison", componentId: "ComparisonSection" },
  { re: /video|film/i, kind: "video", componentId: "VideoSection" },
  { re: /galler/i, kind: "gallery-experience", componentId: "GalleryExperience" },
  { re: /feature stor|storytelling|narrative/i, kind: "feature-story", componentId: "FeatureStorytelling" },
  { re: /interactive product|product showcase/i, kind: "interactive-product", componentId: "ProductInteractive" },
  { re: /pric/i, kind: "pricing", componentId: "PricingTable" },
  { re: /faq/i, kind: "faq", componentId: "FaqAccordion" },
  { re: /testimonial|review/i, kind: "testimonials", componentId: "TestimonialsCarousel" },
  { re: /team/i, kind: "team", componentId: "TeamSection" },
  { re: /contact/i, kind: "contact", componentId: "ContactCta" },
  { re: /cta|call to action/i, kind: "cta", componentId: "CtaBand" },
  { re: /service/i, kind: "services", componentId: "ServicesGrid" },
  { re: /hero/i, kind: "hero", componentId: "HeroCinematic" },
];

function matchSection(text: string): { kind: string; componentId: string } | null {
  for (const alias of SECTION_ALIASES) {
    if (alias.re.test(text)) {
      return { kind: alias.kind, componentId: alias.componentId };
    }
  }
  return null;
}

function findExistingSection(
  understanding: WebsiteUnderstanding,
  kindOrName: string,
): string | undefined {
  const hay = kindOrName.toLowerCase();
  const hit = understanding.homeComponentOrder.find((name) => {
    const n = name.toLowerCase();
    return n.includes(hay) || hay.includes(n.toLowerCase());
  });
  if (hit) return hit;
  const byKind = understanding.sections.find(
    (s) => s.usedOnHome && (s.kindHint.includes(hay) || hay.includes(s.kindHint)),
  );
  return byKind?.exportName;
}

/**
 * Convert a natural-language command into edit actions.
 */
export function parseWebsiteEditCommand(
  command: string,
  understanding: WebsiteUnderstanding,
): WebsiteEditAction[] {
  const text = command.trim();
  if (!text) return [];

  const actions: WebsiteEditAction[] = [];
  const lower = text.toLowerCase();

  // Style / luxury / design system
  if (/luxury|premium|exclusive|high.?end/.test(lower)) {
    actions.push({
      type: "improve-luxury",
      notes: "Increase luxury feeling via tokens, spacing, and cinematic direction",
    });
  }
  if (/change (the )?design style|make it (more )?(modern|minimal|corporate|creative|tech|saas)/.test(lower)) {
    const style =
      lower.match(/\b(modern|minimal|corporate|creative|technology|tech|saas|luxury)\b/)?.[1] ||
      "modern";
    actions.push({
      type: "change-design-style",
      value: style === "tech" ? "technology" : style,
      notes: `Restyle toward ${style}`,
    });
  }

  // Colors
  if (/color|palette|recolor|brand color/.test(lower)) {
    const hexes = text.match(/#(?:[0-9a-fA-F]{3,8})\b/g) || [];
    actions.push({
      type: "update-colors",
      value: hexes[0],
      notes: hexes.length
        ? `Update primary toward ${hexes.join(", ")}`
        : "Refresh brand color harmony",
    });
  }

  // Typography
  if (/font|typograph|typeface|letter/.test(lower)) {
    actions.push({
      type: "update-typography",
      notes: "Update typography hierarchy / font pairing",
    });
  }

  // Spacing
  if (/spacing|whitespace|padding|margin|breath/.test(lower)) {
    actions.push({
      type: "update-spacing",
      value: /tight|compact|dense/.test(lower)
        ? "compact"
        : /airy|spacious|more space/.test(lower)
          ? "airy"
          : "balanced",
      notes: "Adjust section spacing rhythm",
    });
  }

  // Animations
  if (/animat|motion|transition|entrance/.test(lower)) {
    actions.push({
      type: "update-animations",
      notes: "Refine motion / transitions",
    });
  }

  // Add section
  if (/\badd\b|\binclude\b|\binsert\b/.test(lower)) {
    const section = matchSection(text);
    if (section) {
      actions.push({
        type: "add-section",
        sectionKind: section.kind,
        componentId: section.componentId,
        notes: `Add ${section.componentId}`,
      });
    }
  }

  // Remove section
  if (/\bremove\b|\bdelete\b|\bdrop\b/.test(lower)) {
    const section = matchSection(text);
    const existing =
      (section && findExistingSection(understanding, section.componentId)) ||
      (section && findExistingSection(understanding, section.kind));
    if (existing || section) {
      actions.push({
        type: "remove-section",
        target: existing || section?.componentId,
        sectionKind: section?.kind,
        notes: `Remove ${existing || section?.componentId}`,
      });
    }
  }

  // Replace section
  if (/\breplace\b|\bswap\b|\bchange (the )?hero\b/.test(lower)) {
    const from = matchSection(text);
    if (/hero/.test(lower)) {
      let heroId = "HeroCinematic";
      if (/split/.test(lower)) heroId = "HeroSplit";
      else if (/interactive/.test(lower)) heroId = "HeroInteractive";
      else if (/product/.test(lower)) heroId = "HeroProduct";
      else if (/full.?image|image/.test(lower)) heroId = "HeroFullImage";
      else if (/luxury/.test(lower)) heroId = "HeroLuxury";
      const currentHero = understanding.homeComponentOrder.find((n) =>
        /hero/i.test(n),
      );
      actions.push({
        type: "replace-section",
        target: currentHero || "HeroFullBleed",
        replaceWith: heroId,
        componentId: heroId,
        sectionKind: "hero",
        notes: `Replace hero with ${heroId}`,
      });
    } else if (from) {
      actions.push({
        type: "replace-section",
        target: findExistingSection(understanding, from.kind),
        replaceWith: from.componentId,
        componentId: from.componentId,
        sectionKind: from.kind,
      });
    }
  }

  // Restyle section
  if (/restyle|redesign (the )?section|make .+ more/.test(lower) && matchSection(text)) {
    const section = matchSection(text)!;
    actions.push({
      type: "restyle-section",
      target: findExistingSection(understanding, section.componentId),
      componentId: section.componentId,
      sectionKind: section.kind,
      notes: `Restyle ${section.componentId}`,
    });
  }

  // Content rewrite
  if (/rewrite|copy|headline|content|wording|messaging/.test(lower)) {
    actions.push({
      type: "rewrite-content",
      notes: "Rewrite key marketing copy for clarity and brand voice",
    });
  }

  // Layout
  if (/layout|composition|structure|reorder|rearrange/.test(lower)) {
    actions.push({
      type: "improve-layout",
      notes: "Improve layout composition and section rhythm",
    });
  }

  // Conversion
  if (/conversion|cta|convert|book more|leads|signup|trial/.test(lower)) {
    actions.push({
      type: "improve-conversion",
      notes: "Strengthen CTAs, hierarchy, and conversion path",
    });
  }

  // Deduplicate by type+target
  const seen = new Set<string>();
  return actions.filter((a) => {
    const key = `${a.type}:${a.target || ""}:${a.componentId || ""}:${a.value || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function describeEditActions(actions: WebsiteEditAction[]): string {
  if (!actions.length) return "No structured edit actions parsed";
  return actions
    .map((a) => a.notes || `${a.type}${a.target ? ` → ${a.target}` : ""}`)
    .join("; ");
}

/** Map action types that typically need full AI optimize continue. */
export function actionsNeedingAiContinue(
  actions: WebsiteEditAction[],
): WebsiteEditActionType[] {
  return actions
    .filter((a) =>
      [
        "rewrite-content",
        "improve-conversion",
        "improve-layout",
        "restyle-section",
        "change-design-style",
      ].includes(a.type),
    )
    .map((a) => a.type);
}
