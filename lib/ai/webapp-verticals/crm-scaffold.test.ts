import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runAppDesignEngine } from "@/lib/ai-core/app-design-platform/design-engine";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import {
  applyCrmVerticalScaffold,
  isCrmVerticalScaffold,
} from "@/lib/ai/webapp-verticals/crm-scaffold";

describe("CRM vertical scaffold", () => {
  it("detects CRM from template and models", () => {
    assert.equal(isCrmVerticalScaffold({ templateId: "crm" }), true);
    assert.equal(
      isCrmVerticalScaffold({
        dataModels: [
          {
            id: "deal",
            name: "Deal",
            label: "Deal",
            fields: [],
            crud: [],
            relations: [],
          },
          {
            id: "contact",
            name: "Contact",
            label: "Contact",
            fields: [],
            crud: [],
            relations: [],
          },
        ],
      }),
      true,
    );
    assert.equal(isCrmVerticalScaffold({ templateId: "booking" }), false);
  });

  it("injects pipeline page and seed into scaffold", () => {
    const designed = runAppDesignEngine({
      prompt: "CRM for sales pipeline",
      appType: "crm",
      language: "English",
      templateId: "crm",
    });
    const files = buildWebAppScaffold({
      projectName: "Sales CRM",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: designed.model.dataModels.map((m) => m.name),
      dataModels: designed.model.dataModels,
      templateId: "crm",
    });
    assert.ok(files.some((f) => f.path === "prisma/seed.ts"));
    const deals = files.find((f) => f.path === "app/dashboard/deals/page.tsx");
    assert.ok(deals);
    assert.match(deals!.content, /STAGES/);
    assert.match(deals!.content, /pipeline/i);

    const noop = applyCrmVerticalScaffold(
      [{ path: "README.md", language: "markdown", content: "# App\n" }],
      {
        templateId: "booking",
        dataModels: [
          {
            id: "booking",
            name: "Booking",
            label: "Booking",
            fields: [{ name: "startsAt", type: "date", required: true }],
            crud: ["list"],
            relations: [],
          },
        ],
      },
    );
    assert.equal(noop.length, 1);
    assert.ok(!noop.some((f) => f.path === "prisma/seed.ts"));
  });
});
