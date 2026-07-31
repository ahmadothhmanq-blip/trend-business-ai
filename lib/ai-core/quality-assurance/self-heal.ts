import {
  repairAccessibility,
  validateAccessibility,
} from "@/lib/ai-core/accessibility/validate";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { RemediationAction } from "@/lib/ai-core/quality-assurance/qashe-types";
import type { QualityPolicy } from "@/lib/ai-core/quality-assurance/qashe-types";

function inferFileLanguage(path: string): string {
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  return "tsx";
}

function asGeneratedFiles(
  files: Array<{ path: string; content: string }>,
): GeneratedProjectFile[] {
  return files.map((f) => ({
    path: f.path,
    content: f.content,
    language: inferFileLanguage(f.path),
  }));
}

export type SelfHealingResult = {
  files: Array<{ path: string; content: string }>;
  actionsApplied: string[];
  remediationActions: RemediationAction[];
};

/**
 * Apply safe automated remediations — accessibility landmarks, etc.
 */
export function applySelfHealing(
  files: Array<{ path: string; content: string }>,
  policy: QualityPolicy,
): SelfHealingResult {
  const remediationActions: RemediationAction[] = [];
  const actionsApplied: string[] = [];

  if (!policy.autoHealEnabled || files.length === 0) {
    return { files, actionsApplied, remediationActions };
  }

  const asGenerated = asGeneratedFiles(files);
  const a11y = validateAccessibility(asGenerated);
  let healed = asGenerated;

  if (!a11y.passed) {
    const fixable = a11y.issues.filter((i) => i.autoFixable);
    if (fixable.length > 0 && fixable.length <= policy.maxAutoHealActions) {
      healed = repairAccessibility(healed);
      for (const issue of fixable.slice(0, policy.maxAutoHealActions)) {
        actionsApplied.push(`a11y:${issue.id}`);
        remediationActions.push({
          id: `heal-${issue.id}`,
          category: "accessibility",
          description: `Auto-fixed: ${issue.detail}`,
          autoApplied: true,
          requiresHumanReview: false,
          rootCause: issue.rule,
        });
      }
    } else {
      for (const issue of a11y.issues.filter((i) => !i.autoFixable)) {
        remediationActions.push({
          id: `review-${issue.id}`,
          category: "accessibility",
          description: issue.detail,
          autoApplied: false,
          requiresHumanReview: true,
          rootCause: issue.rule,
        });
      }
    }
  }

  return {
    files: healed.map((f) => ({ path: f.path, content: f.content })),
    actionsApplied,
    remediationActions,
  };
}
