import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCanonicalCrudApiRoute,
  buildCanonicalPrismaSchema,
  businessEntityTables,
  toPrismaModelName,
} from "@/lib/ai/webapp-domain-scaffold";

describe("webapp domain scaffold", () => {
  it("builds sqlite prisma schema for business entities", () => {
    const schema = buildCanonicalPrismaSchema(["User", "Product", "OrderLine"]);
    assert.match(schema, /provider = "sqlite"/);
    assert.match(schema, /model User \{/);
    assert.match(schema, /model Product \{/);
    assert.match(schema, /model OrderLine \{/);
    assert.equal(businessEntityTables(["User", "Product"]).includes("User"), false);
    assert.equal(toPrismaModelName("stock_item"), "StockItem");
  });

  it("builds authenticated CRUD API routes for an entity", () => {
    const route = buildCanonicalCrudApiRoute("Product");
    assert.match(route, /db\.product\.findMany/);
    assert.match(route, /t\("crud\.unauthorized"\)/);
    assert.match(route, /isStaffRole/);
    assert.match(route, /ownerId:\s*session\.userId/);
    assert.match(route, /t\("crud\.forbidden"\)/);
    assert.match(route, /export async function DELETE/);
    assert.match(route, /\.strict\(\)/);
    assert.match(route, /createSchema\.safeParse/);
  });

  it("includes User.role and entity ownerId in prisma schema", () => {
    const schema = buildCanonicalPrismaSchema(["Product"]);
    assert.match(schema, /model User \{[\s\S]*\brole\s+String/);
    assert.match(schema, /model Product \{[\s\S]*\bownerId\s+String/);
  });
});
