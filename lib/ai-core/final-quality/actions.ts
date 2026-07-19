/**
 * Final Improvement Actions — suggest + map to editor / optimizer apply paths.
 */

import type { FinalQualityFinding } from "@/lib/ai-core/final-quality/types";
import type {
  FinalImprovementAction,
  FinalImprovementActionKind,
} from "@/lib/ai-core/final-quality/types";
import type { WebsiteEditAction } from "@/lib/ai-core/website-editor/types";

function kindFromFinding(f: FinalQualityFinding): FinalImprovementActionKind {
  if (f.dimension === "visual" || /image|photo|visual/i.test(f.title)) {
    return "improve-images";
  }
  if (f.dimension === "content") return "rewrite-content";
  if (f.dimension === "seo") return "improve-seo";
  if (f.dimension === "conversion" || f.dimension === "journey") {
    return "improve-conversion";
  }
  if (
    f.dimension === "layout" ||
    f.dimension === "typography" ||
    f.dimension === "spacing"
  ) {
    return "improve-design";
  }
  if (/add .*section|missing/i.test(f.action) || /missing/i.test(f.title)) {
    return "add-section";
  }
  if (f.dimension === "mobile" || f.dimension === "performance") {
    return "improve-ux";
  }
  return "improve-ux";
}

function editorActionsFor(
  kind: FinalImprovementActionKind,
  finding: FinalQualityFinding,
): WebsiteEditAction[] | undefined {
  switch (kind) {
    case "improve-design":
      return [{ type: "improve-layout", notes: finding.action }];
    case "rewrite-content":
      return [{ type: "rewrite-content", notes: finding.action }];
    case "improve-conversion":
      return [{ type: "improve-conversion", notes: finding.action }];
    case "improve-ux":
      return [
        { type: "update-spacing", value: "airy" },
        { type: "improve-layout", notes: finding.action },
      ];
    case "add-section":
      if (/testimonial|trust/i.test(finding.action + finding.title)) {
        return [
          {
            type: "add-section",
            sectionKind: "testimonials",
            componentId: "TestimonialsModern",
            notes: finding.action,
          },
        ];
      }
      if (/case|proof/i.test(finding.action + finding.title)) {
        return [
          {
            type: "add-section",
            sectionKind: "case-studies",
            componentId: "CaseStudies",
            notes: finding.action,
          },
        ];
      }
      if (/contact/i.test(finding.action + finding.title)) {
        return [
          {
            type: "add-section",
            sectionKind: "contact",
            componentId: "ContactForm",
            notes: finding.action,
          },
        ];
      }
      return [{ type: "add-section", notes: finding.action }];
    case "improve-images":
      return undefined;
    case "improve-seo":
      return [{ type: "rewrite-content", notes: finding.action }];
    default:
      return undefined;
  }
}

function commandFor(kind: FinalImprovementActionKind, finding: FinalQualityFinding): string {
  switch (kind) {
    case "improve-design":
      return `Improve design: ${finding.action}`;
    case "rewrite-content":
      return `Rewrite content: ${finding.action}`;
    case "add-section":
      return finding.action.startsWith("Add")
        ? finding.action
        : `Add section: ${finding.action}`;
    case "improve-images":
      return `Improve visual assets: ${finding.action}`;
    case "improve-ux":
      return `Improve UX: ${finding.action}`;
    case "improve-conversion":
      return `Improve conversion: ${finding.action}`;
    case "improve-seo":
      return `Improve SEO: ${finding.action}`;
    default:
      return finding.action;
  }
}

/**
 * Build actionable improvements from unified findings.
 */
export function buildFinalImprovementActions(
  findings: FinalQualityFinding[],
): FinalImprovementAction[] {
  const priorityFindings = [...findings].sort((a, b) => {
    const rank = { critical: 0, major: 1, minor: 2, opportunity: 3 };
    return rank[a.severity] - rank[b.severity];
  });

  const seen = new Set<string>();
  const actions: FinalImprovementAction[] = [];
  let i = 0;

  for (const f of priorityFindings) {
    const key = `${f.dimension}:${f.title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    i += 1;
    const kind = kindFromFinding(f);
    actions.push({
      id: `final-action-${i}`,
      kind,
      title: f.title,
      description: f.detail,
      priority:
        f.severity === "critical" || f.severity === "major"
          ? "high"
          : f.severity === "minor"
            ? "medium"
            : "low",
      command: commandFor(kind, f),
      editorActions: editorActionsFor(kind, f),
      optimizeThemes: [f.action],
      applied: false,
    });
    if (actions.length >= 12) break;
  }

  return actions;
}

/**
 * Build an optimizer seed instruction from high-priority actions.
 */
export function finalActionsToOptimizeThemes(
  actions: FinalImprovementAction[],
): string[] {
  return actions
    .filter((a) => a.priority === "high")
    .flatMap((a) => a.optimizeThemes ?? [a.description])
    .slice(0, 10);
}

/**
 * Flatten editor actions from final improvement plan (for Website Editor apply).
 */
export function finalActionsToEditorActions(
  actions: FinalImprovementAction[],
): WebsiteEditAction[] {
  return actions
    .filter((a) => a.priority === "high" && a.editorActions?.length)
    .flatMap((a) => a.editorActions!)
    .slice(0, 8);
}
