import { createAdminClient } from "@/lib/supabase/admin";
import type { WebsiteOptimizationReport } from "@/lib/ai-core/optimizer/types";

export type PersistOptimizerParams = {
  userId: string;
  websiteGenerationId?: string;
  parentGenerationId?: string;
  aiRunId?: string;
  report: WebsiteOptimizationReport;
  action?: string;
  instruction?: string;
  beforeScore?: number;
};

export type PersistOptimizerResult = {
  auditId?: string;
  reportId?: string;
  historyId?: string;
};

export async function persistOptimizerArtifacts(
  params: PersistOptimizerParams,
): Promise<PersistOptimizerResult> {
  const admin = createAdminClient();
  if (!admin) return {};

  try {
    const { data: auditRow, error: auditError } = await admin
      .from("website_audits")
      .insert({
        user_id: params.userId,
        website_generation_id: params.websiteGenerationId ?? null,
        ai_run_id: params.aiRunId ?? null,
        status: "completed",
        design_score: params.report.scores.design,
        seo_score: params.report.scores.seo,
        ux_score: params.report.scores.ux,
        performance_score: params.report.scores.performance,
        overall_score: params.report.scores.overall,
        issues: params.report.audit.issues,
        missing_sections: params.report.audit.missingSections,
        suggestions: params.report.audit.suggestions,
        metadata: {
          source: params.report.audit.source,
          brandConsistent: params.report.audit.brandConsistent,
          mobileReady: params.report.audit.mobileReady,
          conversionReady: params.report.audit.conversionReady,
        },
      })
      .select("id")
      .single();

    if (auditError || !auditRow?.id) {
      console.error("Website Optimizer: audit persist failed", auditError);
      return {};
    }

    const { data: reportRow, error: reportError } = await admin
      .from("optimization_reports")
      .insert({
        user_id: params.userId,
        website_generation_id: params.websiteGenerationId ?? null,
        ai_run_id: params.aiRunId ?? null,
        audit_id: auditRow.id,
        status: params.report.appliedFixes.length ? "applied" : "ready",
        summary: params.report.summary,
        scores: params.report.scores,
        improvements: params.report.improvements,
        applied_fixes: params.report.appliedFixes,
        report_json: params.report,
        metadata: { publishReady: params.report.publishReady },
      })
      .select("id")
      .single();

    if (reportError) {
      console.error("Website Optimizer: report persist failed", reportError);
    }

    let historyId: string | undefined;
    if (params.report.appliedFixes.length || params.action === "optimize") {
      const { data: historyRow } = await admin
        .from("improvement_history")
        .insert({
          user_id: params.userId,
          website_generation_id: params.websiteGenerationId ?? null,
          parent_generation_id: params.parentGenerationId ?? null,
          audit_id: auditRow.id,
          optimization_report_id: reportRow?.id ?? null,
          action: params.action ?? "optimize",
          category: "website-optimizer",
          before_score: params.beforeScore ?? null,
          after_score: params.report.scores.overall,
          instruction: params.instruction ?? params.report.improveInstruction ?? null,
          changes: params.report.appliedFixes,
          metadata: { scores: params.report.scores },
        })
        .select("id")
        .single();
      historyId = historyRow?.id;
    }

    return {
      auditId: auditRow.id,
      reportId: reportRow?.id,
      historyId,
    };
  } catch (error) {
    console.error("Website Optimizer: persist failed", error);
    return {};
  }
}
