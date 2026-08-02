import { classifyValidationGateIssues } from "@/lib/ai-core/quality-authority/gates";
import type { PostRepairVerificationResult } from "@/lib/ai-core/quality-authority/types";

/**
 * Post-repair verification — accept repair only when blocking issues do not regress.
 */
export function verifyPostRepair(params: {
  beforeIssues: string[];
  afterIssues: string[];
}): PostRepairVerificationResult {
  const beforeGate = classifyValidationGateIssues(params.beforeIssues);
  const afterGate = classifyValidationGateIssues(params.afterIssues);

  const beforeSet = new Set(beforeGate.blockingIssues);
  const regressionIssues = afterGate.blockingIssues.filter(
    (issue) => !beforeSet.has(issue),
  );

  const regression =
    regressionIssues.length > 0 ||
    afterGate.blockers.length > beforeGate.blockers.length;

  return {
    accepted: !regression,
    rolledBack: regression,
    beforeBlockerCount: beforeGate.blockers.length,
    afterBlockerCount: afterGate.blockers.length,
    regressionIssues,
  };
}
