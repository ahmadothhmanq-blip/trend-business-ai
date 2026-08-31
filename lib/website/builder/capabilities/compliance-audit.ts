/**
 * SSOT compliance audit for WebsiteCapabilityManifest.
 * Scans source files for direct manifest access patterns.
 */
export type ComplianceFinding = {
  file: string;
  line: number;
  pattern: string;
  severity: "error" | "warning";
  message: string;
};

export type ComplianceAuditReport = {
  findings: ComplianceFinding[];
  directManifestReads: number;
  directManifestWrites: number;
  duplicatePersistenceModules: number;
  architectureComplianceScore: number;
  productionReadinessScore: number;
};

const DIRECT_READ_PATTERNS = [
  /settings\.websiteCapabilityManifest/,
  /settings\?\.\[WB_WEBSITE_CAPABILITY_MANIFEST_SETTING\]/,
  /readWebsiteCapabilityManifest\s*\(/,
  /loadManifestFromProject\s*\(/,
];

const DIRECT_WRITE_PATTERNS = [
  /attachWebsiteCapabilityManifest\s*\(/,
  /ensureProjectWithCapabilityManifest\s*\(/,
  /settings\.websiteCapabilityManifest\s*=/,
  /\[WB_WEBSITE_CAPABILITY_MANIFEST_SETTING\]\s*:/,
];

const ALLOWED_FILES = new Set([
  "lib/website/builder/capabilities/manifest.ts",
  "lib/website/builder/capabilities/service.ts",
  "lib/website/builder/capabilities/settings-guard.ts",
  "lib/website/builder/capabilities/compliance-audit.ts",
  "lib/website/builder/capabilities/manifest.test.ts",
]);

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function auditSourceForManifestCompliance(
  sources: Array<{ path: string; content: string }>,
): ComplianceAuditReport {
  const findings: ComplianceFinding[] = [];
  let directManifestReads = 0;
  let directManifestWrites = 0;
  let duplicatePersistenceModules = 0;

  for (const { path, content } of sources) {
    const normalized = normalizePath(path);
    const lines = content.split("\n");

    if (
      normalized.includes("manifest-store") ||
      /manifest-store\.ts/.test(content)
    ) {
      duplicatePersistenceModules += 1;
      findings.push({
        file: normalized,
        line: 1,
        pattern: "manifest-store",
        severity: "error",
        message: "Duplicate persistence module detected.",
      });
    }

    if (ALLOWED_FILES.has(normalized)) continue;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;

      for (const pattern of DIRECT_READ_PATTERNS) {
        if (pattern.test(line)) {
          directManifestReads += 1;
          findings.push({
            file: normalized,
            line: index + 1,
            pattern: pattern.source,
            severity: "warning",
            message: "Direct manifest read — prefer WebsiteCapabilityService.",
          });
        }
      }

      for (const pattern of DIRECT_WRITE_PATTERNS) {
        if (pattern.test(line)) {
          directManifestWrites += 1;
          findings.push({
            file: normalized,
            line: index + 1,
            pattern: pattern.source,
            severity: "error",
            message: "Direct manifest write — use WebsiteCapabilityService.refresh/rebuild.",
          });
        }
      }
    });
  }

  const errorCount = findings.filter((f) => f.severity === "error").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const architectureComplianceScore = Math.max(
    0,
    100 - errorCount * 15 - warningCount * 5,
  );
  const productionReadinessScore =
    duplicatePersistenceModules === 0 &&
    directManifestWrites === 0 &&
    errorCount === 0
      ? Math.max(70, architectureComplianceScore)
      : Math.max(0, architectureComplianceScore - 20);

  return {
    findings,
    directManifestReads,
    directManifestWrites,
    duplicatePersistenceModules,
    architectureComplianceScore,
    productionReadinessScore,
  };
}

export function formatComplianceAuditReport(
  report: ComplianceAuditReport,
): string {
  const lines = [
    "WebsiteCapabilityManifest SSOT Compliance Audit",
    "================================================",
    `Architecture compliance: ${report.architectureComplianceScore}%`,
    `Production readiness: ${report.productionReadinessScore}%`,
    `Direct reads (outside allowed modules): ${report.directManifestReads}`,
    `Direct writes (outside allowed modules): ${report.directManifestWrites}`,
    `Duplicate persistence modules: ${report.duplicatePersistenceModules}`,
    "",
  ];

  if (report.findings.length === 0) {
    lines.push("No violations found.");
    return lines.join("\n");
  }

  for (const finding of report.findings) {
    lines.push(
      `[${finding.severity.toUpperCase()}] ${finding.file}:${finding.line} — ${finding.message}`,
    );
  }

  return lines.join("\n");
}
