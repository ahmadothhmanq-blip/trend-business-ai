import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCanonicalAuthLoginRoute,
  buildCanonicalAuthModule,
  buildCanonicalAuthSignupRoute,
  buildCanonicalPasswordCryptoModule,
} from "@/lib/ai/webapp-auth-scaffold";
import { buildCanonicalPrismaSchema } from "@/lib/ai/webapp-domain-scaffold";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import type { AppDataModel } from "@/lib/ai-core/app-design-platform/types";

describe("phase0 trust auth + schema", () => {
  it("scaffolds real password hashing and signup", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      tables: ["Item"],
    });
    const paths = new Set(scaffold.map((file) => file.path));

    for (const required of [
      "lib/password.ts",
      "lib/auth.ts",
      "lib/db.ts",
      "prisma/schema.prisma",
      "app/api/auth/login/route.ts",
      "app/api/auth/signup/route.ts",
      "app/signup/page.tsx",
    ]) {
      assert.equal(paths.has(required), true, `missing ${required}`);
    }

    const auth = scaffold.find((file) => file.path === "lib/auth.ts")!.content;
    assert.match(auth, /userId:\s*string/);
    assert.match(auth, /email:\s*string/);
    assert.match(auth, /db\.session/);

    const login = scaffold.find(
      (file) => file.path === "app/api/auth/login/route.ts",
    )!.content;
    assert.match(login, /verifyPassword/);
    assert.match(login, /db\.user\.findUnique/);

    const signup = scaffold.find(
      (file) => file.path === "app/api/auth/signup/route.ts",
    )!.content;
    assert.match(signup, /hashPassword/);

    const schema = scaffold.find(
      (file) => file.path === "prisma/schema.prisma",
    )!.content;
    assert.match(schema, /passwordHash/);
    assert.match(schema, /model Session/);
  });

  it("maps AppDataModel fields into prisma schema", () => {
    const models: AppDataModel[] = [
      {
        id: "stock",
        name: "StockItem",
        label: "Stock Item",
        fields: [
          { name: "sku", type: "string", required: true },
          { name: "quantity", type: "number", required: true },
          { name: "reorderLevel", type: "number", required: false },
        ],
        relations: [],
        crud: ["create", "read", "update", "delete", "list"],
      },
    ];

    const schema = buildCanonicalPrismaSchema(["StockItem"], models);
    assert.match(schema, /model StockItem/);
    assert.match(schema, /\bsku\b/);
    assert.match(schema, /\bquantity\b/);
    assert.match(schema, /\breorderLevel\b/);
    assert.match(schema, /passwordHash/);
  });

  it("readiness rejects fake any-password login", () => {
    const fakeLogin = `import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
export async function POST() {
  const jar = await cookies();
  jar.set({ name: "session", value: randomUUID(), path: "/" });
  return Response.json({ ok: true });
}
`;
    const issues = findWebAppReadinessIssues(
      [
        { path: "app/login/page.tsx", language: "tsx", content: "export default function Page(){return null}" },
        { path: "app/api/auth/login/route.ts", language: "typescript", content: fakeLogin },
      ],
      { requiresAuth: true },
    );

    assert.ok(
      issues.some((issue) => issue.includes("verify passwordHash")),
      issues.join("\n"),
    );
  });

  it("readiness passes hardened scaffold", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Ops",
      requiresAuth: true,
      requiresDatabase: true,
      tables: ["Item"],
      dataModels: [
        {
          id: "item",
          name: "Item",
          label: "Item",
          fields: [{ name: "name", type: "string", required: true }],
          relations: [],
          crud: ["list"],
        },
      ],
    });
    const hardened = hardenGeneratedWebApp(scaffold);
    const issues = findWebAppReadinessIssues(hardened, {
      requiresAuth: true,
      requiresDatabase: true,
    });
    assert.deepEqual(issues, []);
  });

  it("password module uses scrypt", () => {
    const content = buildCanonicalPasswordCryptoModule();
    assert.match(content, /scryptSync/);
    assert.match(content, /hashPassword/);
    assert.match(content, /verifyPassword/);
  });

  it("auth builders stay aligned", () => {
    assert.match(buildCanonicalAuthModule(), /db\.session/);
    assert.match(buildCanonicalAuthLoginRoute(), /verifyPassword/);
    assert.match(buildCanonicalAuthSignupRoute(), /hashPassword/);
  });
});
