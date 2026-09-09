import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildWebAppMobileStoreFiles,
  mergeMobileStoreIntoProjectFiles,
} from "@/lib/ai/webapp-mobile-store";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { validateWebAppProject } from "@/lib/ai/webapp-requirements";
import { validateGeneratedProject } from "@/lib/ai/validator";

describe("webapp mobile-store packaging", () => {
  it("emits PWA, Capacitor, and store checklist files", () => {
    const mobile = buildWebAppMobileStoreFiles({
      title: "Booking App",
      pkgName: "booking-app",
    });

    assert.ok(mobile.some((f) => f.path === "public/manifest.webmanifest"));
    assert.ok(mobile.some((f) => f.path === "mobile-store/capacitor.config.ts"));
    assert.ok(mobile.some((f) => f.path === "mobile-store/GOOGLE_PLAY.md"));
    assert.ok(mobile.some((f) => f.path === "mobile-store/APPLE_APP_STORE.md"));
    assert.ok(mobile.some((f) => f.path === "public/.well-known/assetlinks.json"));
    assert.ok(mobile.some((f) => f.path === "mobile-store/package.json"));

    const manifest = mobile.find((f) => f.path === "public/manifest.webmanifest");
    assert.ok(manifest?.content.includes('"display": "standalone"'));

    const nestedPkg = JSON.parse(
      mobile.find((f) => f.path === "mobile-store/package.json")!.content,
    ) as { devDependencies: Record<string, string> };
    assert.ok(nestedPkg.devDependencies["@capacitor/cli"]);
  });

  it("includes mobile-store in the standard scaffold", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Store Ready App",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Booking"],
    });
    assert.ok(scaffold.some((f) => f.path === "mobile-store/README.md"));
    assert.ok(scaffold.some((f) => f.path === "mobile-store/package.json"));
    assert.ok(scaffold.some((f) => f.path === "app/pwa-register.tsx"));

    const layout = scaffold.find((f) => f.path === "app/layout.tsx");
    assert.match(layout?.content ?? "", /manifest\.webmanifest/);
    assert.match(layout?.content ?? "", /PwaRegister/);
  });

  it("merges mobile-store into existing project files", () => {
    const merged = mergeMobileStoreIntoProjectFiles(
      [
        {
          path: "app/page.tsx",
          content: "export default function P() { return null; }",
          language: "tsx",
        },
      ],
      { title: "Merged App" },
    );
    assert.ok(merged.length > 1);
    assert.ok(merged.some((f) => f.path === "mobile-store/twa-manifest.json"));
  });

  it("validates capacitor imports against mobile-store/package.json (not root)", () => {
    const rootPkg = {
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: {
        next: "16.0.0",
        react: "19.0.0",
        "react-dom": "19.0.0",
      },
      devDependencies: {
        typescript: "5.0.0",
        tailwindcss: "4.0.0",
        eslint: "9.0.0",
        prettier: "3.0.0",
      },
    };
    const files = [
      {
        path: "package.json",
        language: "json",
        content: JSON.stringify(rootPkg),
      },
      {
        path: "mobile-store/package.json",
        language: "json",
        content: JSON.stringify({
          devDependencies: { "@capacitor/cli": "^7.0.0" },
        }),
      },
      {
        path: "mobile-store/capacitor.config.ts",
        language: "typescript",
        content: `import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = { appId: "app.example", appName: "App", webDir: "../out" };
export default config;
`,
      },
      {
        path: "app/page.tsx",
        language: "tsx",
        content: `export default function Home() { return null; }
`,
      },
    ];

    const ok = validateGeneratedProject(
      files,
      {
        requiresAuth: false,
        requiresDatabase: false,
        requiresDashboard: false,
        isEcommerce: false,
        isSaas: false,
        databaseProvider: "none",
      },
      { requiredPaths: [] },
    );

    assert.equal(ok.valid, true, ok.issues.join("\n"));
    assert.equal(
      ok.issues.some((issue) => issue.includes("@capacitor/cli")),
      false,
    );
  });

  it("reports missing nested deps against the nested package.json path", () => {
    const rootPkg = {
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: {
        next: "16.0.0",
        react: "19.0.0",
        "react-dom": "19.0.0",
      },
      devDependencies: {
        typescript: "5.0.0",
        tailwindcss: "4.0.0",
        eslint: "9.0.0",
        prettier: "3.0.0",
      },
    };
    const result = validateGeneratedProject(
      [
        {
          path: "package.json",
          language: "json",
          content: JSON.stringify(rootPkg),
        },
        {
          path: "mobile-store/package.json",
          language: "json",
          content: JSON.stringify({ devDependencies: {} }),
        },
        {
          path: "mobile-store/capacitor.config.ts",
          language: "typescript",
          content: `import type { CapacitorConfig } from "@capacitor/cli";
export default {} as CapacitorConfig;
`,
        },
      ],
      {
        requiresAuth: false,
        requiresDatabase: false,
        requiresDashboard: false,
        isEcommerce: false,
        isSaas: false,
        databaseProvider: "none",
      },
      { requiredPaths: [] },
    );

    assert.equal(result.valid, false);
    assert.ok(
      result.issues.some(
        (issue) =>
          issue.includes("mobile-store/capacitor.config.ts") &&
          issue.includes("mobile-store/package.json") &&
          issue.includes("@capacitor/cli"),
      ),
      result.issues.join("\n"),
    );
  });

  it("passes validateWebAppProject for the hardened standard scaffold", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Item"],
    });
    const hardened = hardenGeneratedWebApp(scaffold);
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
      ["Item"],
    );
    assert.equal(validation.valid, true, validation.issues.join("\n"));
  });
});
