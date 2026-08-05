import { createHash, randomUUID } from "node:crypto";
import { AWQE_SPEC_VERSION } from "@/lib/ai-core/generation-engine/quality-engine/constants";
import type { MasterPlan } from "@/lib/ai-core/generation-engine/master-plan/types";
import type {
  AwqeEvaluationResult,
  AwqeImprovementReport,
  AwqeWebsiteSpecification,
} from "@/lib/ai-core/generation-engine/quality-engine/types";
import type { AwqeImprovedPlan } from "@/lib/ai-core/generation-engine/quality-engine/improve";
import {
  buildSpecPages,
  buildSpecSections,
  optimizeAccessibility,
  optimizeConversion,
  optimizePerformance,
  optimizeSeo,
} from "@/lib/ai-core/generation-engine/quality-engine/optimize";

export function buildWebsiteSpecification(input: {
  masterPlan: MasterPlan;
  improved: AwqeImprovedPlan;
  evaluation: AwqeEvaluationResult;
  report: AwqeImprovementReport;
}): AwqeWebsiteSpecification {
  const { masterPlan, improved, evaluation, report } = input;
  const sections = improved.sections;

  const seo = optimizeSeo(masterPlan, sections);
  const conversion = optimizeConversion(masterPlan, sections);
  const accessibility = optimizeAccessibility(masterPlan, sections);
  const performance = optimizePerformance(masterPlan, sections);

  const pages = buildSpecPages(
    {
      ...masterPlan,
      pages: masterPlan.pages.map((p) => ({
        ...p,
        sections: sections.filter((s) => s.pageId === p.id).sort((a, b) => a.order - b.order).map((s) => s.id),
      })),
    },
    seo,
  );

  return {
    id: randomUUID(),
    version: 1,
    schemaVersion: AWQE_SPEC_VERSION,
    createdAt: new Date().toISOString(),
    masterPlanId: masterPlan.id,
    masterPlanVersion: masterPlan.version,
    providerIndependent: true,

    pages,
    sections: buildSpecSections(sections, performance, accessibility),
    navigation: masterPlan.navigation,
    businessFeatures: masterPlan.businessFeatures,

    seo,
    conversion,
    accessibility,
    performance,

    scores: evaluation.scores,
    report,
  };
}

export function hashSpecification(spec: AwqeWebsiteSpecification): string {
  return createHash("sha256")
    .update([spec.id, spec.masterPlanId, String(spec.scores.overall), AWQE_SPEC_VERSION].join("|"))
    .digest("hex")
    .slice(0, 16);
}

export function specificationToSettingsPatch(spec: AwqeWebsiteSpecification): Record<string, string> {
  return {
    awqeSpecId: spec.id,
    awqeSpecVersion: spec.schemaVersion,
    awqeOverallScore: String(spec.scores.overall),
    awqeMasterPlanId: spec.masterPlanId,
  };
}
