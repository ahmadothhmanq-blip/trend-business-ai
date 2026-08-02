import type {
  ClassifiedQualityIssue,
  QualityGateResult,
  QualityIssueCategory,
} from "@/lib/ai-core/quality-authority/types";

const NODE_BUILTIN_PACKAGES = new Set([
  "crypto",
  "node:crypto",
  "fs",
  "path",
  "os",
  "util",
  "stream",
  "buffer",
  "events",
]);

function classifyIssue(issue: string): ClassifiedQualityIssue {
  if (issue.startsWith("Missing required production file:")) {
    return { issue, severity: "blocker", category: "missing_file" };
  }

  if (
    issue.includes("missing project import") ||
    issue.includes("missing relative import")
  ) {
    return { issue, severity: "blocker", category: "broken_import" };
  }

  if (/imports "([^"]+)" but package\.json is missing/.test(issue)) {
    const pkg = issue.match(/missing "([^"]+)"/)?.[1];
    if (pkg && NODE_BUILTIN_PACKAGES.has(pkg)) {
      return { issue, severity: "warning", category: "build" };
    }
    return { issue, severity: "blocker", category: "build" };
  }

  if (
    issue.includes("package.json") ||
    issue.includes("not valid JSON") ||
    issue.includes("Generated file content is empty") ||
    issue.includes("does not match planned path") ||
    issue.includes("must include dev, build and start scripts") ||
    issue.includes("must include next and react") ||
    issue.includes("must include typescript and tailwindcss") ||
    issue.includes("must include ESLint") ||
    issue.includes("must include prettier") ||
    issue.includes("SVG file must contain valid SVG markup")
  ) {
    return { issue, severity: "blocker", category: "build" };
  }

  if (issue.includes("placeholder or incomplete content")) {
    return { issue, severity: "warning", category: "content" };
  }

  if (issue.startsWith("Duplicate basename")) {
    return { issue, severity: "warning", category: "validation" };
  }

  return { issue, severity: "warning", category: "validation" };
}

export function classifyValidationGateIssues(
  issues: string[],
): QualityGateResult {
  const blockers: ClassifiedQualityIssue[] = [];
  const warnings: ClassifiedQualityIssue[] = [];

  for (const issue of issues) {
    const classified = classifyIssue(issue);
    if (classified.severity === "blocker") {
      blockers.push(classified);
    } else {
      warnings.push(classified);
    }
  }

  return {
    passed: blockers.length === 0,
    blockers,
    warnings,
    blockingIssues: blockers.map((entry) => entry.issue),
    warningIssues: warnings.map((entry) => entry.issue),
  };
}

export function evaluateProjectQualityGate(issues: string[]): QualityGateResult {
  return classifyValidationGateIssues(issues);
}

export function countBlockingIssues(issues: string[]): number {
  return classifyValidationGateIssues(issues).blockers.length;
}

export function issueCategory(
  issue: ClassifiedQualityIssue,
): QualityIssueCategory {
  return issue.category;
}
