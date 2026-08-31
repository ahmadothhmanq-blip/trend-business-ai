import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import type { PublishGateCheck } from "@/lib/website/publish-gate/types";
import { evaluateIndustryImageGate } from "@/lib/website/publish-gate/industry-images";

export { evaluateIndustryImageGate } from "@/lib/website/publish-gate/industry-images";

const GENERIC_PHRASES = [
  "welcome to our website",
  "lorem ipsum",
  "your trusted partner",
  "we are a leading",
];

export function evaluateContentQualityGate(
  project: GeneratedWebsiteProject,
): PublishGateCheck[] {
  const checks: PublishGateCheck[] = [];
  const home = project.files.find((f) => f.path.includes("page.tsx"))?.content ?? "";

  for (const phrase of GENERIC_PHRASES) {
    if (home.toLowerCase().includes(phrase)) {
      checks.push({
        id: "content-quality",
        passed: false,
        severity: "warning",
        message: `Generic copy detected: "${phrase}"`,
      });
    }
  }

  if (!checks.length) {
    checks.push({
      id: "content-quality",
      passed: true,
      severity: "info",
      message: "No generic copy blockers detected",
    });
  }

  return checks;
}

export function evaluatePerformanceBudgetGate(
  project: GeneratedWebsiteProject,
): PublishGateCheck[] {
  const checks: PublishGateCheck[] = [];
  const largeFiles = project.files.filter(
    (f) => f.content.length > 80_000,
  );
  if (largeFiles.length) {
    checks.push({
      id: "performance",
      passed: false,
      severity: "warning",
      message: `${largeFiles.length} file(s) exceed 80KB — may hurt LCP`,
    });
  } else {
    checks.push({
      id: "performance",
      passed: true,
      severity: "info",
      message: "File size budget OK",
    });
  }
  return checks;
}

export function evaluateIndustryImageQualityGate(
  project: GeneratedWebsiteProject,
): PublishGateCheck[] {
  return evaluateIndustryImageGate(project);
}
