import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildWebAppScaffold,
  groupWebAppFilesIntoWaves,
  listWebAppAiFilePlans,
} from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { buildDeterministicFilePlans } from "@/plugins/webapp/deterministic-plan";

describe("buildWebAppScaffold", () => {
  it("provides isolated toolchain files without LLM", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Inventory Ops",
      requiresAuth: true,
    });
    const paths = new Set(scaffold.map((file) => file.path));

    for (const required of [
      "package.json",
      "tsconfig.json",
      "next.config.ts",
      "postcss.config.js",
      "eslint.config.mjs",
      "app/globals.css",
      "lib/utils.ts",
      "components/ui.tsx",
      "lib/auth.ts",
    ]) {
      assert.equal(paths.has(required), true, `missing ${required}`);
    }

    const nextConfig = scaffold.find((file) => file.path === "next.config.ts")!.content;
    assert.match(nextConfig, /turbopack:\s*\{\s*root:/);
    assert.match(nextConfig, /outputFileTracingRoot/);

    const ui = scaffold.find((file) => file.path === "components/ui.tsx")!.content;
    assert.match(ui, /asChild/);
    assert.match(ui, /export function Card/);
    assert.match(ui, /BadgeVariant/);

    const auth = scaffold.find((file) => file.path === "lib/auth.ts")!.content;
    assert.match(auth, /sessionId: string/);
    assert.match(auth, /userId: string/);
    assert.match(auth, /email: string/);
    assert.equal(auth.includes("session.user"), false);
    assert.match(auth, /db\.session/);

    assert.equal(
      scaffold.some((file) => file.path === "app/signup/page.tsx"),
      true,
    );
    assert.equal(
      scaffold.some((file) => file.path === "lib/password.ts"),
      true,
    );
  });

  it("omits auth module when requiresAuth is false", () => {
    const scaffold = buildWebAppScaffold({ requiresAuth: false });
    assert.equal(
      scaffold.some((file) => file.path === "lib/auth.ts"),
      false,
    );
    assert.equal(
      scaffold.some((file) => file.path === "middleware.ts"),
      false,
    );
  });

  it("scaffolds runtime modules so they skip DeepSeek file generation", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Product", "StockItem"],
    });
    const paths = new Set(scaffold.map((file) => file.path));
    for (const required of [
      "middleware.ts",
      "lib/db.ts",
      "prisma/schema.prisma",
      "app/api/auth/login/route.ts",
      "app/api/auth/logout/route.ts",
      "app/login/page.tsx",
      "app/layout.tsx",
      "app/providers.tsx",
      "app/page.tsx",
      "app/dashboard/layout.tsx",
      "app/dashboard/page.tsx",
      "app/api/products/route.ts",
      "app/dashboard/products/page.tsx",
      "app/api/stock-items/route.ts",
      "app/dashboard/stock-items/page.tsx",
      "hooks/use-auth.ts",
      "tailwind.config.ts",
    ]) {
      assert.equal(paths.has(required), true, `missing ${required}`);
    }

    const pkg = JSON.parse(
      scaffold.find((file) => file.path === "package.json")!.content,
    );
    assert.equal(Boolean(pkg.dependencies["@prisma/client"]), true);
    assert.match(pkg.scripts.build, /prisma generate/);
  });

  it("covers the full deterministic plan so AI file count is zero", () => {
    const analysis = {
      appName: "Ops",
      appType: "saas",
      complexity: "moderate" as const,
      pages: ["Home", "Login", "Dashboard", "Items"],
      features: ["auth"],
      technologies: ["next"],
      databaseTables: ["Item", "User"],
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
      requiresAuth: analysis.requiresAuth,
      requiresDatabase: analysis.requiresDatabase,
      requiresDashboard: analysis.requiresDashboard,
      tables: analysis.databaseTables,
    });
    const aiFiles = listWebAppAiFilePlans(
      plans.map((plan) => plan.path),
      scaffold.map((file) => file.path),
    );
    assert.deepEqual(aiFiles, []);
  });

  it("survives hardener without dropping scaffold contracts", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      tables: ["Item"],
    });
    const hardened = hardenGeneratedWebApp(scaffold);

    const ui = hardened.find((file) => file.path === "components/ui.tsx")!.content;
    assert.match(ui, /asChild/);
    assert.equal(
      hardened.some((file) => file.path === "next.config.ts"),
      true,
    );
    assert.equal(
      hardened.some((file) => file.path === "app/providers.tsx"),
      true,
    );
    assert.equal(
      hardened.some((file) => file.path === "prisma/schema.prisma"),
      true,
    );
    assert.equal(
      hardened.some((file) => file.path === "app/api/items/route.ts"),
      true,
    );
  });

  it("groups AI files into dependency waves", () => {
    const waves = groupWebAppFilesIntoWaves([
      { path: "app/page.tsx", category: "pages" },
      { path: "lib/format.ts", category: "lib" },
      { path: "app/api/items/route.ts", category: "api" },
      { path: "components/table.tsx", category: "components" },
    ]);

    assert.deepEqual(
      waves.map((wave) => wave.map((file) => file.path)),
      [
        ["lib/format.ts"],
        ["app/api/items/route.ts", "components/table.tsx"],
        ["app/page.tsx"],
      ],
    );
  });
});
