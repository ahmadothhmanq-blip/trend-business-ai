import { randomUUID } from "node:crypto";
import type { QualityReport } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { insertQualityReport } from "@/lib/ai-core/video-production-platform/persistence/repository";
import type { ArtifactQualityReport } from "@/lib/ai-core/video-production-platform/quality-control/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function persistArtifactQualityReport(
  supabase: AnySupabase,
  input: {
    userId: string;
    projectId: string;
    subject?: QualityReport["subject"];
    subjectId?: string;
    report: ArtifactQualityReport;
  },
): Promise<QualityReport> {
  const domain: QualityReport = {
    id: randomUUID(),
    projectId: input.projectId,
    subject: input.subject || "artifact",
    subjectId: input.subjectId || input.projectId,
    ready: input.report.ready,
    score: input.report.score,
    summary: input.report.summary,
    blockers: input.report.blockers,
  };
  return insertQualityReport(supabase, {
    userId: input.userId,
    report: domain,
    warnings: input.report.warnings,
    extra: {
      verdict: input.report.verdict,
      checks: input.report.checks,
    },
  });
}
