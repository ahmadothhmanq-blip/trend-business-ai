import {
  evaluatePublishGates,
  type PublishGateResult,
} from "@/lib/website/publish-gates";
import { dedupeStrings } from "@/lib/ai-core/quality-platform/heuristics";
import type { GeneratedWebsiteProject } from "@/lib/website/types";
import type {
  UnifiedPublishGateResult,
  UnifiedQualityReport,
} from "@/lib/ai-core/quality-platform/types";
import type { WebsiteGeneration } from "@/types/database";
import { isPublishGateEnabled } from "@/lib/website/generation-flags";
import {
  evaluateContentQualityGate,
  evaluateIndustryImageQualityGate,
  evaluatePerformanceBudgetGate,
} from "@/lib/website/publish-gate/evaluate";

function loadProject(generation: WebsiteGeneration): GeneratedWebsiteProject | null {
  const raw = generation.blueprint;
  if (!raw || typeof raw !== "object") return null;
  return raw as unknown as GeneratedWebsiteProject;
}

/**
 * Unified publish gates — wraps legacy evaluatePublishGates and merges platform report.
 */
export function evaluateUnifiedPublishGates(
  generation: WebsiteGeneration,
): UnifiedPublishGateResult & { legacy: PublishGateResult } {
  const legacy = evaluatePublishGates(generation);
  const project = loadProject(generation);
  const unified = project?.unifiedQualityReport as UnifiedQualityReport | undefined;

  let blockers = dedupeStrings([...legacy.blockers]);
  let warnings = dedupeStrings([
    ...legacy.warnings,
    ...(unified?.issues
      .filter((i) => i.severity === "warning")
      .map((i) => i.message) ?? []),
  ]);

  if (isPublishGateEnabled() && project) {
    const extraChecks = [
      ...evaluateContentQualityGate(project),
      ...evaluatePerformanceBudgetGate(project),
      ...evaluateIndustryImageQualityGate(project),
    ];
    for (const check of extraChecks) {
      if (!check.passed) {
        if (check.severity === "blocker") blockers.push(check.message);
        else warnings.push(check.message);
      }
    }
    blockers = dedupeStrings(blockers);
    warnings = dedupeStrings(warnings);
  }

  const scores = { ...legacy.scores };
  if (unified?.scores) {
    scores.overall = unified.scores.overall;
    scores.seo = unified.scores.seo;
    scores.ux = unified.scores.ux;
    scores.design = unified.scores.ui;
  }

  const publishReady =
    legacy.publishReady &&
    (unified?.publishReady ?? true) &&
    (!isPublishGateEnabled() || blockers.length === 0);

  return {
    publishReady,
    blockers,
    warnings,
    opportunities: legacy.opportunities,
    scores,
    unifiedScores: unified?.scores,
    qualityTrace: unified?.trace,
    legacy,
  };
}
