import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCanonicalAuthModule,
  buildCanonicalAuthLoginRoute,
  buildCanonicalAuthSignupRoute,
  buildCanonicalAuthLogoutRoute,
} from "@/lib/ai/webapp-auth-scaffold";
import { buildCanonicalCrudApiRoute, buildCanonicalPrismaSchema } from "@/lib/ai/webapp-domain-scaffold";
import { hardenCanonicalSessionConsumers } from "@/lib/ai/webapp-harden-auth";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { buildCanonicalMiddleware } from "@/lib/ai/webapp-runtime-scaffold";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";

describe("generated app RBAC", () => {
  it("stores role on User, Session, signed login/signup cookies, and logout cleanup", () => {
    const auth = buildCanonicalAuthModule();
    assert.match(auth, /role:\s*string/);
    assert.match(auth, /role:\s*row\.user\.role/);
    assert.match(auth, /export function isStaffRole/);
    assert.match(auth, /export function requireRole/);

    const schema = buildCanonicalPrismaSchema(["Order"]);
    assert.match(schema, /model User \{[\s\S]*\brole\s+String\s+@default\("user"\)/);
    assert.match(schema, /model Order \{[\s\S]*\bownerId\s+String/);

    assert.match(buildCanonicalAuthLoginRoute(), /signSessionCookie/);
    assert.match(buildCanonicalAuthLoginRoute(), /role:\s*user\.role/);
    assert.match(buildCanonicalAuthSignupRoute(), /userCount === 0 \? "admin" : "user"/);
    assert.match(buildCanonicalAuthSignupRoute(), /signSessionCookie/);
    assert.match(buildCanonicalAuthLogoutRoute(), /verifySessionCookie/);
  });

  it("enforces staff vs owner checks in CRUD APIs", () => {
    const route = buildCanonicalCrudApiRoute("Invoice");
    assert.match(route, /isStaffRole\(session\.role\)/);
    assert.match(route, /ownerId:\s*session\.userId/);
    assert.match(route, /existing\.ownerId !== session\.userId/);
    assert.match(route, /status:\s*403/);
    assert.match(route, /\.strict\(\)/);
    assert.doesNotMatch(route, /_ignoredOwnerId/);
  });

  it("middleware verifies signed sessions and protects APIs", () => {
    const middleware = buildCanonicalMiddleware();
    assert.match(middleware, /verifySessionCookie/);
    assert.match(middleware, /\/api\/:path\*/);
    assert.match(middleware, /t\("middleware\.forbidden"\)/);
    assert.match(middleware, /STAFF_ROLES/);
    assert.match(middleware, /\/dashboard\/admin/);
    assert.doesNotMatch(middleware, /cookies\.get\(\s*["']session_role["']\s*\)/);
  });

  it("hardener maps session.user.role to session.role (never sessionId)", () => {
    const rewritten = hardenCanonicalSessionConsumers(
      "const r = session.user.role; const o = session?.user?.role;",
    );
    assert.match(rewritten, /session\.role/);
    assert.match(rewritten, /session\?\.role/);
    assert.doesNotMatch(rewritten, /session\.sessionId/);
    assert.doesNotMatch(rewritten, /session\?\.sessionId/);
  });

  it("hardened scaffold passes readiness with RBAC", () => {
    const scaffold = buildWebAppScaffold({
      projectName: "Clinic",
      requiresAuth: true,
      requiresDatabase: true,
      tables: ["Patient"],
    });
    const hardened = hardenGeneratedWebApp(scaffold);
    const issues = findWebAppReadinessIssues(hardened, {
      requiresAuth: true,
      requiresDatabase: true,
    });
    assert.deepEqual(issues, [], issues.join("\n"));

    const crud = hardened.find((file) => file.path === "app/api/patients/route.ts");
    assert.ok(crud);
    assert.match(crud!.content, /isStaffRole/);
    assert.match(crud!.content, /ownerId/);
  });
});
