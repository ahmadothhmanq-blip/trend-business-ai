import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { PlannedFileLike } from "@/lib/ai/validator";
import {
  mergeWebAppProductionRequirements,
  missingWebAppRequirementPaths,
  validateWebAppProject,
} from "@/lib/ai/webapp-requirements";

describe("webapp production requirements", () => {
  it("requires prisma, auth, and CRUD files instead of host eslintrc", () => {
    const merged = mergeWebAppProductionRequirements(
      [] as PlannedFileLike[],
      {
        requiresAuth: true,
        requiresDatabase: true,
        requiresDashboard: true,
        isEcommerce: false,
        isSaas: false,
        databaseProvider: "prisma",
      },
      ["Product"],
    );
    const paths = merged.map((file) => file.path);

    assert.equal(paths.includes("eslint.config.mjs"), true);
    assert.equal(paths.includes(".eslintrc.json"), false);
    assert.equal(paths.includes("prisma/schema.prisma"), true);
    assert.equal(paths.includes("lib/db.ts"), true);
    assert.equal(paths.includes("app/login/page.tsx"), true);
    assert.equal(paths.includes("app/signup/page.tsx"), true);
    assert.equal(paths.includes("lib/password.ts"), true);
    assert.equal(paths.includes("middleware.ts"), true);
    assert.equal(paths.includes("app/api/products/route.ts"), true);
    assert.equal(paths.includes("components/ui/button.tsx"), false);
    assert.equal(paths.includes("components/ui.tsx"), true);
  });

  it("treats eslint flat config as satisfying lint requirements", () => {
    const files: GeneratedProjectFile[] = [
      { path: "eslint.config.mjs", content: "export default [];", language: "javascript" },
    ];
    const missing = missingWebAppRequirementPaths(
      files,
      {
        requiresAuth: false,
        requiresDatabase: false,
        requiresDashboard: false,
        isEcommerce: false,
        isSaas: false,
        databaseProvider: "none",
      },
    );
    assert.equal(missing.includes("eslint.config.mjs"), false);
    assert.equal(missing.includes(".eslintrc.json"), false);
  });

  it("fails validation when a database app has no Prisma API surface", () => {
    const result = validateWebAppProject(
      [
        {
          path: "app/page.tsx",
          content: "export default function Home() { return null; }",
          language: "tsx",
        },
      ],
      {
        requiresAuth: false,
        requiresDatabase: true,
        requiresDashboard: false,
        isEcommerce: false,
        isSaas: false,
        databaseProvider: "prisma",
      },
      ["Product"],
    );

    assert.equal(result.valid, false);
    assert.ok(result.issues.some((issue) => issue.includes("prisma/schema.prisma")));
    assert.ok(result.issues.some((issue) => issue.includes("Prisma-backed API")));
  });

  it("allows index.ts barrels in different folders", () => {
    const result = validateWebAppProject(
      [
        {
          path: "types/index.ts",
          content: "export type Product = { id: string };",
          language: "typescript",
        },
        {
          path: "hooks/index.ts",
          content: "export function useProducts() { return []; }",
          language: "typescript",
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
    );

    assert.equal(
      result.issues.some((issue) => issue.includes("Duplicate basename")),
      false,
    );
  });
});
