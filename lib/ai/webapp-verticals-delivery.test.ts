import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runAppDesignEngine } from "@/lib/ai-core/app-design-platform/design-engine";
import { listAppTemplates } from "@/lib/ai-core/app-design-platform/templates";
import { auditAppTemplate } from "@/lib/ai-core/app-design-platform/template-quality";
import { createDeployment } from "@/lib/ai-core/app-design-platform/deploy";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { findInteractiveAppPreviewReadinessIssues } from "@/lib/webapp/interactive-preview/readiness";
import { buildAppPreviewManifest } from "@/lib/webapp/interactive-preview/manifest";
import { buildInteractiveAppPreviewHtml } from "@/lib/webapp/interactive-preview/build";
import { entitySlug } from "@/lib/ai/webapp-requirements";
import { toPrismaModelName } from "@/lib/ai/webapp-domain-scaffold";
import { getWebappTypeForTemplate } from "@/lib/constants/webapp-builder";

const VERTICALS = [
  {
    id: "booking" as const,
    prompt: "Booking system for salon appointments and services",
    specializedPath: "app/dashboard/bookings/page.tsx",
    specializedMarker: /Booking agenda|AgendaPage/i,
    seedHint: /Haircut|Maya Nasser|confirmed/i,
  },
  {
    id: "ecommerce" as const,
    prompt: "Online store with products cart and order fulfillment",
    specializedPath: "app/dashboard/orders/page.tsx",
    specializedMarker: /Order fulfillment|FulfillmentPage/i,
    seedHint: /Studio Desk Lamp|buyer@example.com|shipped/i,
  },
  {
    id: "healthcare" as const,
    prompt: "Clinic app for patients appointments and medical records",
    specializedPath: "app/dashboard/appointments/page.tsx",
    specializedMarker: /Clinic board|ClinicBoardPage/i,
    seedHint: /Hana Youssef|Annual checkup|checked-in/i,
  },
  {
    id: "finance" as const,
    prompt: "Accounting ledger with accounts transactions and budgets",
    specializedPath: "app/dashboard/transactions/page.tsx",
    specializedMarker: /Finance ledger|FinanceLedgerPage/i,
    seedHint: /Operating Cash|Client payment|INV-204/i,
  },
];

describe("flagship vertical delivery verification", () => {
  for (const vertical of VERTICALS) {
    it(`delivers production-credible ${vertical.id}`, () => {
      const template = listAppTemplates().find((t) => t.id === vertical.id);
      assert.ok(template, `${vertical.id} template`);
      assert.deepEqual(auditAppTemplate(template!), []);

      const designed = runAppDesignEngine({
        prompt: vertical.prompt,
        appType: getWebappTypeForTemplate(vertical.id),
        language: "English",
        templateId: vertical.id,
      });
      assert.equal(designed.model.templateId, vertical.id);

      const files = hardenGeneratedWebApp(
        buildWebAppScaffold({
          projectName: designed.model.settings.appName,
          language: "English",
          requiresAuth: true,
          requiresDatabase: true,
          requiresDashboard: true,
          tables: designed.model.dataModels.map((m) => m.name),
          dataModels: designed.model.dataModels,
          templateId: vertical.id,
        }),
      );

      const readiness = findWebAppReadinessIssues(files, {
        requiresAuth: true,
        requiresDatabase: true,
      });
      assert.deepEqual(readiness, [], readiness.join("\n"));

      const previewIssues = findInteractiveAppPreviewReadinessIssues(designed.model);
      assert.deepEqual(previewIssues, [], previewIssues.join("\n"));

      const manifest = buildAppPreviewManifest(designed.model);
      assert.ok(manifest.entities.length >= designed.model.dataModels.length);
      assert.ok(
        manifest.entities.every((entity) => entity.fields.length >= 3),
        `${vertical.id} preview fields`,
      );

      assert.ok(files.some((f) => f.path === "prisma/seed.ts"), `${vertical.id} seed`);
      assert.ok(files.some((f) => f.path === "app/api/admin/users/route.ts"));

      for (const model of designed.model.dataModels) {
        const schema = files.find((f) => f.path === "prisma/schema.prisma")?.content ?? "";
        assert.match(schema, new RegExp(`model\\s+${toPrismaModelName(model.name)}\\b`));
        const slug = entitySlug(model.name);
        assert.ok(files.some((f) => f.path === `app/api/${slug}/route.ts`));
        assert.ok(files.some((f) => f.path === `app/dashboard/${slug}/page.tsx`));
      }

      const specialized = files.find((f) => f.path === vertical.specializedPath);
      assert.ok(specialized, `${vertical.id} specialized page`);
      assert.match(specialized!.content, vertical.specializedMarker);

      const html = buildInteractiveAppPreviewHtml({ model: designed.model });
      assert.match(html, /trust-banner|zipHonesty|reset-demo/i);
      assert.match(html, vertical.seedHint);

      const deploy = createDeployment({
        generationId: `00000000-0000-4000-8000-${String(vertical.id.length).padStart(2, "0")}${vertical.id}000000`.slice(0, 36),
        environment: "production",
        baseUrl: "https://example.com",
        files,
        appName: designed.model.settings.appName,
        previewHtml: html,
        readinessIssues: [],
      });
      assert.equal(deploy.kind, "public-host");
      assert.match(deploy.message, /not a full Next\.js/i);
    });
  }
});
