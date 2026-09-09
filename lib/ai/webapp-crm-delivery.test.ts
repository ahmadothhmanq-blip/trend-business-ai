import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runAppDesignEngine } from "@/lib/ai-core/app-design-platform/design-engine";
import { listAppTemplates } from "@/lib/ai-core/app-design-platform/templates";
import { auditAppTemplate } from "@/lib/ai-core/app-design-platform/template-quality";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { findInteractiveAppPreviewReadinessIssues } from "@/lib/webapp/interactive-preview/readiness";
import { buildAppPreviewManifest } from "@/lib/webapp/interactive-preview/manifest";
import { inspectMobileStorePackaging } from "@/lib/webapp/store-packaging-health";
import { createDeployment } from "@/lib/ai-core/app-design-platform/deploy";
import { entitySlug } from "@/lib/ai/webapp-requirements";
import { toPrismaModelName } from "@/lib/ai/webapp-domain-scaffold";

/**
 * Single end-to-end CRM verification (one app only) covering scaffold,
 * harden, readiness, preview fidelity, packaging notes, and honest deploy.
 */
describe("CRM app delivery verification (single app)", () => {
  it("builds a production-credible CRM from the design engine model", () => {
    const crmTemplate = listAppTemplates().find((t) => t.id === "crm");
    assert.ok(crmTemplate);
    assert.deepEqual(auditAppTemplate(crmTemplate!), []);

    const designed = runAppDesignEngine({
      prompt: "CRM for sales team contacts and deals pipeline",
      appType: "crm",
      language: "English",
      templateId: "crm",
    });

    const files = hardenGeneratedWebApp(
      buildWebAppScaffold({
        projectName: designed.model.settings.appName,
        language: "English",
        requiresAuth: true,
        requiresDatabase: true,
        requiresDashboard: true,
        tables: designed.model.dataModels.map((m) => m.name),
        dataModels: designed.model.dataModels,
        templateId: "crm",
      }),
    );

    const readiness = findWebAppReadinessIssues(files, {
      requiresAuth: true,
      requiresDatabase: true,
    });
    assert.deepEqual(readiness, []);

    const previewIssues = findInteractiveAppPreviewReadinessIssues(designed.model);
    assert.deepEqual(previewIssues, []);

    const manifest = buildAppPreviewManifest(designed.model);
    assert.ok(manifest.entities.length >= designed.model.dataModels.length);
    assert.ok(
      manifest.entities.every((entity) => entity.fields.length >= 3),
      "preview entities should expose real fields",
    );
    assert.ok(
      manifest.navigation.some((item) => item.href.includes("/admin/staff")),
      "staff nav in preview",
    );

    assert.ok(files.some((f) => f.path === "app/api/admin/users/route.ts"));
    assert.ok(files.some((f) => f.path === "app/dashboard/admin/staff/page.tsx"));
    for (const model of designed.model.dataModels) {
      const schema = files.find((f) => f.path === "prisma/schema.prisma")?.content ?? "";
      assert.match(schema, new RegExp(`model\\s+${toPrismaModelName(model.name)}\\b`));
      const slug = entitySlug(model.name);
      assert.ok(
        files.some((f) => f.path === `app/api/${slug}/route.ts`),
        `missing API for ${model.name}`,
      );
      assert.ok(
        files.some((f) => f.path === `app/dashboard/${slug}/page.tsx`),
        `missing dashboard for ${model.name}`,
      );
    }

    assert.ok(files.some((f) => f.path === "prisma/seed.ts"), "CRM seed missing");
    const dealsPage = files.find((f) => f.path === "app/dashboard/deals/page.tsx");
    assert.ok(dealsPage, "deals dashboard missing");
    assert.match(dealsPage!.content, /Deal pipeline|STAGES|pipeline/i);
    const pkg = files.find((f) => f.path === "package.json");
    assert.ok(pkg);
    assert.match(pkg!.content, /"db:seed"/);

    const packaging = inspectMobileStorePackaging(files);
    assert.ok(packaging.length > 0);
    assert.ok(
      packaging.some((note) => /placeholder|SHA256|PNG|host/i.test(note)),
      packaging.join(" | "),
    );

    const deploy = createDeployment({
      generationId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      environment: "production",
      baseUrl: "https://example.com",
      files,
      appName: designed.model.settings.appName,
      previewHtml: "<html><body>ok</body></html>",
      readinessIssues: [],
    });
    assert.equal(deploy.kind, "public-host");
    assert.match(deploy.message, /interactive preview/i);
    assert.match(deploy.message, /not a full Next\.js/i);
  });
});
