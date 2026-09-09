import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runAppDesignEngine } from "@/lib/ai-core/app-design-platform/design-engine";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";

const VERTICALS = [
  {
    id: "booking",
    prompt: "Booking system for salon appointments",
    pagePath: "app/dashboard/bookings/page.tsx",
    marker: /Booking agenda|AgendaPage/i,
  },
  {
    id: "ecommerce",
    prompt: "Online store with products and order fulfillment",
    pagePath: "app/dashboard/orders/page.tsx",
    marker: /Order fulfillment|FulfillmentPage/i,
  },
  {
    id: "healthcare",
    prompt: "Clinic app for patients and appointments",
    pagePath: "app/dashboard/appointments/page.tsx",
    marker: /Clinic board|ClinicBoardPage/i,
  },
  {
    id: "finance",
    prompt: "Accounting ledger with accounts and transactions",
    pagePath: "app/dashboard/transactions/page.tsx",
    marker: /Finance ledger|FinanceLedgerPage/i,
  },
] as const;

describe("vertical ZIP scaffolds", () => {
  for (const vertical of VERTICALS) {
    it(`specializes ${vertical.id} scaffold with board + seed`, () => {
      const designed = runAppDesignEngine({
        prompt: vertical.prompt,
        appType: vertical.id === "ecommerce" ? "ecommerce-admin" : vertical.id,
        language: "English",
        templateId: vertical.id,
      });
      const files = buildWebAppScaffold({
        projectName: `${vertical.id} app`,
        requiresAuth: true,
        requiresDatabase: true,
        requiresDashboard: true,
        tables: designed.model.dataModels.map((m) => m.name),
        dataModels: designed.model.dataModels,
        templateId: vertical.id,
      });
      assert.ok(files.some((f) => f.path === "prisma/seed.ts"), `${vertical.id} seed`);
      const page = files.find((f) => f.path === vertical.pagePath);
      assert.ok(page, `${vertical.id} missing ${vertical.pagePath}`);
      assert.match(page!.content, vertical.marker);
      const pkg = files.find((f) => f.path === "package.json");
      assert.ok(pkg);
      assert.match(pkg!.content, /"db:seed"/);
    });
  }
});
