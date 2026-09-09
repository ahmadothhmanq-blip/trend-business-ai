import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import type { AppDataModel } from "@/lib/ai-core/app-design-platform/types";
import {
  CRUD_PROTECTED_SYSTEM_FIELDS,
  buildCanonicalCrudApiRoute,
  buildCanonicalEntityDashboardPage,
  crudRouteHasInputValidation,
  crudRouteHasMassAssignmentRisk,
  extractPrismaModelFieldNames,
  isCrudProtectedSystemField,
  resolveCrudWritableFields,
} from "@/lib/ai/webapp-domain-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { rewriteUnsafeCrudApiRoutes } from "@/lib/ai/webapp-harden-runtime";

describe("generated CRUD input validation (no mass assignment)", () => {
  it("protects system fields from the writable allowlist", () => {
    for (const field of CRUD_PROTECTED_SYSTEM_FIELDS) {
      assert.equal(isCrudProtectedSystemField(field), true, field);
    }
    assert.equal(isCrudProtectedSystemField("name"), false);
    assert.equal(isCrudProtectedSystemField("notes"), false);

    const model: AppDataModel = {
      id: "item",
      name: "Item",
      label: "Item",
      fields: [
        { name: "name", type: "string", required: true },
        { name: "ownerId", type: "string", required: true },
        { name: "role", type: "string", required: false },
        { name: "id", type: "string", required: true },
        { name: "createdAt", type: "date", required: false },
        { name: "price", type: "money", required: true },
      ],
      relations: [],
      crud: ["create", "read", "update", "delete", "list"],
    };

    const writable = resolveCrudWritableFields("Item", { dataModel: model });
    assert.deepEqual(
      writable.map((field) => field.name).sort(),
      ["name", "price"],
    );
    assert.ok(writable.every((field) => !isCrudProtectedSystemField(field.name)));
  });

  it("emits Zod .strict() create/update schemas and never spreads raw bodies", () => {
    const route = buildCanonicalCrudApiRoute("Product");
    assert.match(route, /from\s+["']zod["']/);
    assert.match(route, /createSchema\s*=\s*z\.object/);
    assert.match(route, /updateSchema\s*=\s*z\.object/);
    assert.match(route, /\.strict\(\)/);
    assert.match(route, /createSchema\.safeParse/);
    assert.match(route, /updateSchema\.safeParse/);
    assert.match(route, /ownerId:\s*session\.userId/);
    assert.doesNotMatch(route, /data:\s*body\b/);
    assert.doesNotMatch(route, /\.\.\.rest\b/);
    assert.doesNotMatch(route, /as Record<\s*string\s*,\s*unknown\s*>/);
    assert.equal(crudRouteHasInputValidation(route), true);
    assert.equal(crudRouteHasMassAssignmentRisk(route), false);

    assert.match(route, /name:\s*z\.string\(\)/);
    assert.match(route, /notes:\s*z\.string\(\)\.optional\(\)/);
    const createSchemaBlock = route.match(
      /const createSchema = z\.object\(\{([\s\S]*?)\}\)\.strict\(\);/,
    )?.[1] ?? "";
    const updateSchemaBlock = route.match(
      /const updateSchema = z\.object\(\{([\s\S]*?)\}\)\.strict\(\);/,
    )?.[1] ?? "";
    assert.doesNotMatch(createSchemaBlock, /\bownerId\b|\brole\b|\bid\b|\bcreatedAt\b/);
    assert.doesNotMatch(updateSchemaBlock, /\bownerId\b|\brole\b|\bcreatedAt\b/);
    assert.match(updateSchemaBlock, /\bid:\s*z\.string\(\)\.min\(1\)/);
  });

  it("rejects unknown and protected fields via generated schemas", () => {
    const route = buildCanonicalCrudApiRoute("Product");
    assert.match(route, /const createSchema = z\.object\(\{[\s\S]*\}\)\.strict\(\);/);
    assert.match(route, /const updateSchema = z\.object\(\{[\s\S]*\}\)\.strict\(\);/);
    assert.deepEqual(
      resolveCrudWritableFields("Product").map((field) => field.name),
      ["name", "notes"],
    );

    // Same allowlist contract the generator emits (.strict() rejects unknowns + system fields).
    const createSchema = z
      .object({
        name: z.string(),
        notes: z.string().optional(),
      })
      .strict();
    const updateSchema = z
      .object({
        id: z.string().min(1),
        name: z.string().optional(),
        notes: z.string().optional(),
      })
      .strict();

    assert.equal(createSchema.safeParse({ name: "Widget" }).success, true);
    assert.equal(
      createSchema.safeParse({ name: "Widget", ownerId: "attacker" }).success,
      false,
    );
    assert.equal(
      createSchema.safeParse({ name: "Widget", role: "admin" }).success,
      false,
    );
    assert.equal(
      createSchema.safeParse({ name: "Widget", id: "forced" }).success,
      false,
    );
    assert.equal(
      createSchema.safeParse({
        name: "Widget",
        createdAt: new Date().toISOString(),
      }).success,
      false,
    );
    assert.equal(
      createSchema.safeParse({ name: "Widget", unexpected: true }).success,
      false,
    );

    assert.equal(
      updateSchema.safeParse({ id: "rec_1", name: "Renamed" }).success,
      true,
    );
    assert.equal(
      updateSchema.safeParse({ id: "rec_1", ownerId: "attacker" }).success,
      false,
    );
    assert.equal(
      updateSchema.safeParse({ id: "rec_1", role: "admin" }).success,
      false,
    );
    assert.equal(
      updateSchema.safeParse({ id: "rec_1", updatedAt: new Date() }).success,
      false,
    );
  });

  it("entity dashboard pages render AppDataModel fields (not only name/notes)", () => {
    const model: AppDataModel = {
      id: "invoice",
      name: "Invoice",
      label: "Invoice",
      fields: [
        { name: "name", type: "string", required: true },
        { name: "amount", type: "money", required: true },
        { name: "status", type: "enum", required: true, enumValues: ["draft", "paid"] },
        { name: "ownerId", type: "string", required: true },
      ],
      relations: [],
      crud: ["create", "read", "update", "delete", "list"],
    };
    const page = buildCanonicalEntityDashboardPage("Invoice", { dataModel: model });
    assert.match(page, /"name"/);
    assert.match(page, /"amount"/);
    assert.match(page, /"status"/);
    assert.match(page, /"money"/);
    assert.match(page, /draft/);
    assert.match(page, /paid/);
    assert.doesNotMatch(page, /JSON\.stringify\(\{\s*name,\s*notes\s*\}\)/);
    assert.match(page, /coercePayload/);
  });

  it("detects mass-assignment risk and readiness fails closed", () => {
    const unsafe = `import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  const session = await getSession();
  const body = (await request.json()) as Record<string, unknown>;
  const data = await db.item.create({ data: body as never });
  return Response.json({ data });
}
`;
    assert.equal(crudRouteHasMassAssignmentRisk(unsafe), true);
    assert.equal(crudRouteHasInputValidation(unsafe), false);

    const scaffold = buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      tables: ["Item"],
    });
    const poisoned = scaffold.map((file) =>
      file.path === "app/api/items/route.ts"
        ? { ...file, content: unsafe }
        : file,
    );
    const issues = findWebAppReadinessIssues(poisoned, {
      requiresAuth: true,
      requiresDatabase: true,
    });
    assert.ok(
      issues.some((issue) => issue.includes("Zod .strict()")),
      issues.join("\n"),
    );
  });

  it("hardener rewrites unsafe CRUD routes to Zod allowlists", () => {
    const files = [
      {
        path: "prisma/schema.prisma",
        language: "prisma",
        content: `model Product {
  id String @id
  name String
  ownerId String
}
`,
      },
      {
        path: "app/api/products/route.ts",
        language: "typescript",
        content: `import { db } from "@/lib/db";
export async function POST(request: Request) {
  const body = await request.json();
  return Response.json(await db.product.create({ data: body as never }));
}
`,
      },
    ];

    const rewritten = rewriteUnsafeCrudApiRoutes(files);
    const api = rewritten.find((file) => file.path === "app/api/products/route.ts")!;
    assert.equal(crudRouteHasInputValidation(api.content), true);
    assert.equal(crudRouteHasMassAssignmentRisk(api.content), false);
    assert.match(api.content, /name:\s*z\.string/);
    assert.doesNotMatch(api.content, /data:\s*body\b/);

    const fieldNames = extractPrismaModelFieldNames(files[0]!.content, "Product");
    assert.deepEqual(fieldNames.sort(), ["id", "name", "ownerId"]);
  });

  it("hardened scaffold passes readiness with input validation", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      requiresDashboard: true,
      tables: ["Item"],
      dataModels: [
        {
          id: "item",
          name: "Item",
          label: "Item",
          fields: [
            { name: "name", type: "string", required: true },
            { name: "qty", type: "number", required: false },
          ],
          relations: [],
          crud: ["list", "create", "update", "delete"],
        },
      ],
    });
    const hardened = hardenGeneratedWebApp(scaffold);
    const issues = findWebAppReadinessIssues(hardened, {
      requiresAuth: true,
      requiresDatabase: true,
    });
    assert.deepEqual(issues, [], issues.join("\n"));

    const crud = hardened.find((file) => file.path === "app/api/items/route.ts")!;
    assert.match(crud.content, /qty:\s*z\.number\(\)\.optional\(\)/);
    assert.match(crud.content, /\.strict\(\)/);
  });
});
