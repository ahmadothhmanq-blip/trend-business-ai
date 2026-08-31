import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  entityTablesFromAppModel,
  resolveWebAppEntityTables,
} from "@/lib/ai/webapp-entity-tables";
import { applyDeterministicScaffoldGaps } from "@/lib/ai/webapp-scaffold-gaps";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { validateWebAppProject } from "@/lib/ai/webapp-requirements";
import { listWebAppAiFilePlans, buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { buildDeterministicFilePlans } from "@/plugins/webapp/deterministic-plan";

describe("webapp entity table alignment", () => {
  it("prefers app-model tables over thinner analysis tables", () => {
    const tables = resolveWebAppEntityTables({
      analysisTables: ["User", "Item"],
      appModelTables: ["StockItem", "Warehouse", "Supplier", "PurchaseOrder"],
    });
    assert.deepEqual(tables.slice(0, 4), [
      "StockItem",
      "Warehouse",
      "Supplier",
      "PurchaseOrder",
    ]);
    assert.ok(tables.includes("Item"));
  });

  it("reads names from structured app model", () => {
    assert.deepEqual(
      entityTablesFromAppModel({
        dataModels: [{ name: "Product" }, { name: "Order" }],
      }),
      ["Product", "Order"],
    );
  });
});

describe("deterministic scaffold gap fill (no LLM)", () => {
  it("injects missing entity CRUD when validation tables exceed thin analysis", () => {
    const thinScaffold = buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Item", "User"],
    });

    const richTables = [
      "StockItem",
      "Warehouse",
      "Supplier",
      "PurchaseOrder",
    ];
    const gap = applyDeterministicScaffoldGaps(thinScaffold, {
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: richTables,
    });

    assert.ok(gap.injectedPaths.includes("app/api/stock-items/route.ts"));
    assert.ok(gap.injectedPaths.includes("app/dashboard/warehouses/page.tsx"));
    assert.ok(gap.injectedPaths.includes("app/api/suppliers/route.ts"));
    assert.ok(gap.injectedPaths.includes("app/dashboard/purchase-orders/page.tsx"));
    assert.ok(
      gap.injectedPaths.includes("prisma/schema.prisma") ||
        gap.files
          .find((file) => file.path === "prisma/schema.prisma")!
          .content.includes("model StockItem"),
    );

    const hardened = hardenGeneratedWebApp(gap.files);
    const validation = validateWebAppProject(
      hardened,
      {
        requiresAuth: true,
        requiresDatabase: true,
        requiresDashboard: true,
        isEcommerce: false,
        isSaas: true,
        databaseProvider: "prisma",
      },
      richTables,
    );
    assert.equal(validation.valid, true, validation.issues.join("\n"));
  });

  it("resyncs drifted LLM CRUD APIs and thin prisma schema without LLM", () => {
    const thin = buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Item"],
    });

    const drifted: typeof thin = [
      ...thin.filter((file) => file.path !== "prisma/schema.prisma"),
      {
        path: "prisma/schema.prisma",
        language: "prisma",
        content: `generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
model Item {
  id String @id @default(cuid())
}
`,
      },
      {
        path: "app/api/purchase-orders/route.ts",
        language: "typescript",
        content: `import { db } from "@/lib/db";
export async function GET() {
  return Response.json(await db.purchaseOrder.findMany());
}
`,
      },
      {
        path: "app/api/stock-items/route.ts",
        language: "typescript",
        content: `import { db } from "@/lib/db";
export async function GET() {
  return Response.json(await db.stockItem.findMany());
}
`,
      },
    ];

    const richTables = ["StockItem", "Warehouse", "Supplier", "PurchaseOrder"];
    const gap = applyDeterministicScaffoldGaps(drifted, {
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: richTables,
    });

    const schema = gap.files.find((file) => file.path === "prisma/schema.prisma")!;
    assert.match(schema.content, /model StockItem/);
    assert.match(schema.content, /model PurchaseOrder/);
    assert.ok(gap.replacedPaths.includes("prisma/schema.prisma"));

    const purchaseApi = gap.files.find(
      (file) => file.path === "app/api/purchase-orders/route.ts",
    )!;
    assert.match(purchaseApi.content, /db\.purchaseOrder\./);
    assert.ok(gap.replacedPaths.includes("app/api/purchase-orders/route.ts"));

    const stockApi = gap.files.find(
      (file) => file.path === "app/api/stock-items/route.ts",
    )!;
    assert.match(stockApi.content, /db\.stockItem\./);

    const hardened = hardenGeneratedWebApp(gap.files);
    const validation = validateWebAppProject(
      hardened,
      {
        requiresAuth: true,
        requiresDatabase: true,
        requiresDashboard: true,
        isEcommerce: false,
        isSaas: true,
        databaseProvider: "prisma",
      },
      richTables,
    );
    assert.equal(validation.valid, true, validation.issues.join("\n"));
  });

  it("keeps AI file count at zero for unified rich entity plans", () => {
    const analysis = {
      appName: "Ops",
      appType: "saas",
      complexity: "moderate" as const,
      pages: ["Home", "Login", "Dashboard"],
      features: ["auth"],
      technologies: ["next"],
      databaseTables: [
        "StockItem",
        "Warehouse",
        "Supplier",
        "PurchaseOrder",
        "User",
      ],
      apiEndpoints: [],
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      isEcommerce: false,
      isSaas: true,
      databaseProvider: "prisma" as const,
    };
    const plans = buildDeterministicFilePlans(analysis);
    const scaffold = buildWebAppScaffold({
      projectName: analysis.appName,
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: analysis.databaseTables,
    });
    const aiFiles = listWebAppAiFilePlans(
      plans.map((plan) => plan.path),
      scaffold.map((file) => file.path),
    );
    assert.deepEqual(aiFiles, []);
  });
});
