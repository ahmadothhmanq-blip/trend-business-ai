import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateTemplatePurity } from "@/lib/website-builder-platform/validation/template-purity";
import { validateIdentityPreservation } from "@/lib/website-builder-platform/validation/identity-preservation";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

describe("website-builder-platform validation", () => {
  it("flags forbidden business phrases in design files", () => {
    const report = validateTemplatePurity(
      [
        {
          path: "lib/website/template-v2/flagship/about-section.tsx",
          content: 'title = "A partner built for lasting impact"',
          language: "tsx",
        },
      ],
      "production",
    );
    assert.equal(report.ok, false);
    assert.ok(report.violations.some((v) => v.rule === "forbidden-business-phrase"));
  });

  it("passes clean design files", () => {
    const report = validateTemplatePurity(
      [
        {
          path: "lib/website/template-v2/flagship/section-shell.tsx",
          content: "export function PackageSectionShell() { return null; }",
          language: "tsx",
        },
      ],
      "production",
    );
    assert.equal(report.ok, true);
  });

  it("preserves business identity on template switch simulation", () => {
    const base: GeneratedWebsiteProject = {
      projectKind: "website",
      title: "Acme Dental",
      description: "Premium dental care",
      pages: ["/"],
      sections: ["hero"],
      colorPalette: [],
      typography: [],
      components: [],
      content: ["Hero headline", "About copy"],
      seo: ["Acme Dental", "Premium dental"],
      roadmap: [],
      files: [
        {
          path: "app/globals.css",
          content: ":root { --color-primary: #000; }",
          language: "css",
        },
      ],
      businessProfile: {
        industry: "clinic",
        businessType: "Dental",
        targetAudience: "Families",
        projectName: "Acme Dental",
        businessGoals: ["Book appointments"],
        offer: "Dental care",
        tone: "professional",
        geography: "Local",
        competitors: [],
        kpis: [],
        summary: "Premium dental",
        requiredSections: ["hero"],
      },
    };

    const switched: GeneratedWebsiteProject = {
      ...base,
      files: [
        {
          path: "app/globals.css",
          content: ":root { --color-primary: #3366ff; }",
          language: "css",
        },
      ],
    };

    const report = validateIdentityPreservation(base, switched);
    assert.equal(report.ok, true);
    assert.equal(report.designChanged, true);
    assert.deepEqual(report.changed, []);
  });
});
