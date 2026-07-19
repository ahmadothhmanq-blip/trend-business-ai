/**
 * AI Improvement Suggestions — design, UX, conversion, missing sections.
 */

import type { WebsiteUnderstanding } from "@/lib/ai-core/website-editor/types";
import type {
  WebsiteEditorSuggestionsReport,
  WebsiteImprovementSuggestion,
} from "@/lib/ai-core/website-editor/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

function hasKind(understanding: WebsiteUnderstanding, kind: string): boolean {
  return understanding.sections.some(
    (s) => s.usedOnHome && s.kindHint.includes(kind),
  ) || understanding.homeComponentOrder.some((n) =>
    n.toLowerCase().includes(kind.replace(/-/g, "")),
  );
}

function hasComponent(understanding: WebsiteUnderstanding, re: RegExp): boolean {
  return understanding.homeComponentOrder.some((n) => re.test(n));
}

/**
 * Build actionable improvement suggestions after generation / before editing.
 */
export function buildWebsiteImprovementSuggestions(params: {
  understanding: WebsiteUnderstanding;
  project?: GeneratedWebsiteProject | null;
}): WebsiteEditorSuggestionsReport {
  const { understanding, project } = params;
  const suggestions: WebsiteImprovementSuggestion[] = [];
  let i = 0;
  const push = (s: Omit<WebsiteImprovementSuggestion, "id">) => {
    i += 1;
    suggestions.push({ ...s, id: `suggest-${i}` });
  };

  // Missing sections
  if (!hasComponent(understanding, /CaseStud/i) && !hasKind(understanding, "case")) {
    push({
      category: "missing-section",
      title: "Add case studies",
      description: "Editorial proof sections raise trust for services and SaaS brands.",
      command: "Add a case studies section",
      priority: "high",
      actions: [
        {
          type: "add-section",
          sectionKind: "case-studies",
          componentId: "CaseStudies",
        },
      ],
    });
  }
  if (!hasComponent(understanding, /BrandTrust|SocialProof|Testimonial/i)) {
    push({
      category: "missing-section",
      title: "Add brand trust",
      description: "Logo rhythm + metrics build credibility without card clutter.",
      command: "Add a brand trust section",
      priority: "high",
      actions: [
        {
          type: "add-section",
          sectionKind: "brand-trust",
          componentId: "BrandTrust",
        },
      ],
    });
  }
  if (!hasComponent(understanding, /FeatureStory|Storytelling/i)) {
    push({
      category: "design",
      title: "Upgrade to feature storytelling",
      description: "Replace repetitive feature cards with narrative story bands.",
      command: "Add feature storytelling section",
      priority: "medium",
      actions: [
        {
          type: "add-section",
          sectionKind: "feature-story",
          componentId: "FeatureStorytelling",
        },
      ],
    });
  }
  if (!hasComponent(understanding, /Video/i)) {
    push({
      category: "missing-section",
      title: "Add a video section",
      description: "A cinematic video frame strengthens brand atmosphere.",
      command: "Add a video section",
      priority: "low",
      actions: [
        { type: "add-section", sectionKind: "video", componentId: "VideoSection" },
      ],
    });
  }

  // Design
  if (!hasComponent(understanding, /HeroCinematic|HeroLuxury/i)) {
    push({
      category: "design",
      title: "Upgrade to cinematic hero",
      description: "A film-still hero reads more premium than a generic split.",
      command: "Replace the hero with a cinematic hero",
      priority: "medium",
      actions: [
        {
          type: "replace-section",
          replaceWith: "HeroCinematic",
          componentId: "HeroCinematic",
          sectionKind: "hero",
        },
      ],
    });
  }
  push({
    category: "design",
    title: "Improve luxury feeling",
    description: "Apply luxury brand tokens, airy spacing, and cinematic presence.",
    command: "Improve the luxury feeling of the website",
    priority: "medium",
    actions: [{ type: "improve-luxury" }],
  });

  // UX / spacing
  push({
    category: "ux",
    title: "Increase section breathing room",
    description: "Airier spacing improves scannability on desktop and mobile.",
    command: "Increase spacing and make the layout more airy",
    priority: "medium",
    actions: [{ type: "update-spacing", value: "airy" }],
  });
  push({
    category: "ux",
    title: "Smooth transitions",
    description: "Tune motion tokens for premium entrances without noise.",
    command: "Improve animations and transitions",
    priority: "low",
    actions: [{ type: "update-animations" }],
  });

  // Conversion
  push({
    category: "conversion",
    title: "Strengthen conversion path",
    description: "Clarify primary CTA labels, hierarchy, and proof near the ask.",
    command: "Improve conversion and CTA clarity",
    priority: "high",
    actions: [{ type: "improve-conversion" }],
  });

  // Content
  push({
    category: "content",
    title: "Rewrite key headlines",
    description: "Sharper value propositions aligned to brand voice.",
    command: "Rewrite the headlines and key content for clarity",
    priority: "medium",
    actions: [{ type: "rewrite-content" }],
  });

  // Visual coverage from Advanced AI Assets Engine
  const photoCount =
    project?.assetManifest?.items?.filter(
      (a) =>
        a.url &&
        a.role !== "icon" &&
        !a.url.startsWith("data:image/svg"),
    ).length ?? 0;
  if (photoCount < 6) {
    push({
      category: "design",
      title: "Enrich premium visuals",
      description:
        "Agency sites need hero, product, service, gallery, and testimonial photography across key sections.",
      command: "Improve visual assets and section photography",
      priority: "high",
    });
  }
  if (project?.assetManifest?.qualityReport && !project.assetManifest.qualityReport.passed) {
    push({
      category: "design",
      title: "Fix asset quality issues",
      description: project.assetManifest.qualityReport.summary,
      command: "Regenerate missing or low-quality website images",
      priority: "high",
    });
  }

  // From existing engine reports
  const conv = project?.conversionReport?.recommendations ?? [];
  for (const r of conv.slice(0, 3)) {
    push({
      category: "conversion",
      title: r.title,
      description: r.detail || r.action || r.title,
      command: r.action || r.title,
      priority:
        r.severity === "critical" || r.severity === "major" ? "high" : "medium",
    });
  }
  const critic = project?.designCriticReport?.findings ?? [];
  for (const f of critic.slice(0, 3)) {
    push({
      category: "design",
      title: f.title || "Design improvement",
      description: f.action || f.detail || f.title,
      command: f.action || f.title,
      priority: f.severity === "critical" ? "high" : "medium",
    });
  }
  const seo = project?.seoPerformanceReport?.recommendations ?? [];
  for (const r of seo.slice(0, 2)) {
    push({
      category: "seo",
      title: r.title,
      description: r.detail || r.action || r.title,
      command: `Improve SEO: ${r.action || r.title}`,
      priority: "medium",
    });
  }

  // Deduplicate titles
  const seen = new Set<string>();
  const unique = suggestions.filter((s) => {
    const key = s.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Priority sort
  const rank = { high: 0, medium: 1, low: 2 };
  unique.sort((a, b) => rank[a.priority] - rank[b.priority]);

  return {
    suggestions: unique.slice(0, 12),
    summary: `${unique.length} improvement suggestions for ${understanding.brandName}`,
    generatedAt: new Date().toISOString(),
  };
}
