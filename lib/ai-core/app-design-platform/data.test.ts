import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toPrismaSchemaSketch } from "@/lib/ai-core/app-design-platform/data";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";

describe("toPrismaSchemaSketch", () => {
  it("emits generator + sqlite datasource and model blocks with id", () => {
    const model = {
      version: 1,
      templateId: "inventory",
      architecture: "dashboard-sidebar",
      industry: "Logistics",
      appType: "inventory",
      settings: { appName: "Inventory", language: "English", features: [] },
      brand: {
        businessName: "Inventory Inc",
        tokens: {
          primary: "#0F766E",
          secondary: "#134E4A",
          accent: "#FBBF24",
          background: "#042F2E",
          foreground: "#F0FDFA",
          surface: "#042F2E",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          headingFont: "Geist",
          bodyFont: "Geist",
          radius: "12px",
          density: "comfortable",
        },
      },
      screens: [],
      navigation: [],
      components: [],
      dataModels: [
        {
          id: "m1",
          name: "Product",
          label: "Product",
          fields: [{ name: "title", type: "string", required: true }],
          relations: [],
          crud: ["create", "read", "update", "delete", "list"],
        },
      ],
      roles: [],
      workflows: [],
      catalog: [],
      featureFlags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as StructuredAppModel;

    const schema = toPrismaSchemaSketch(model);
    assert.match(schema, /generator client\s*\{\s*provider\s*=\s*"prisma-client-js"/);
    assert.match(schema, /datasource db\s*\{\s*provider\s*=\s*"sqlite"/);
    assert.match(schema, /url\s*=\s*env\("DATABASE_URL"\)/);
    assert.match(schema, /model Product\s*\{/);
    assert.match(schema, /id String @id @default\(cuid\(\)\)/);
    assert.match(schema, /title String/);
  });
});

