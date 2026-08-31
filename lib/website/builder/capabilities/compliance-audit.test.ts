import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  auditSourceForManifestCompliance,
  formatComplianceAuditReport,
} from "@/lib/website/builder/capabilities/compliance-audit";

describe("compliance-audit", () => {
  it("flags duplicate persistence modules and direct writes", () => {
    const report = auditSourceForManifestCompliance([
      {
        path: "lib/foo/bad-consumer.ts",
        content: `
          project.settings.websiteCapabilityManifest = manifest;
          attachWebsiteCapabilityManifest(project, manifest);
        `,
      },
      {
        path: "lib/website/builder/capabilities/manifest-store.ts",
        content: "export function load() {}",
      },
    ]);

    assert.ok(report.duplicatePersistenceModules >= 1);
    assert.ok(report.directManifestWrites >= 1);
    assert.ok(report.architectureComplianceScore < 100);
    assert.ok(formatComplianceAuditReport(report).includes("ERROR"));
  });

  it("allows manifest.ts as the single persistence module", () => {
    const report = auditSourceForManifestCompliance([
      {
        path: "lib/website/builder/capabilities/manifest.ts",
        content: `
          settings[WB_WEBSITE_CAPABILITY_MANIFEST_SETTING] = frozen;
          export function persistManifestToProject() {}
        `,
      },
      {
        path: "components/panel.tsx",
        content: `
          const service = WebsiteCapabilityService.refresh(project);
          service.hasCapability("pricing");
        `,
      },
    ]);

    assert.equal(report.duplicatePersistenceModules, 0);
    assert.equal(report.directManifestWrites, 0);
    assert.equal(report.directManifestReads, 0);
    assert.equal(report.architectureComplianceScore, 100);
  });
});
