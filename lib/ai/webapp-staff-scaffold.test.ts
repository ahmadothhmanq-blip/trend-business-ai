import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ASSIGNABLE_USER_ROLES,
  buildCanonicalStaffDashboardPage,
  buildCanonicalStaffUsersApiRoute,
} from "@/lib/ai/webapp-staff-scaffold";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";

describe("staff role assignment scaffold", () => {
  it("API requires staff, never returns passwordHash, guards last admin", () => {
    const route = buildCanonicalStaffUsersApiRoute();
    assert.match(route, /isStaffRole\(session\.role\)/);
    assert.match(route, /db\.user\.findMany/);
    assert.match(route, /db\.user\.update/);
    assert.match(route, /select:\s*\{\s*id:\s*true,\s*email:\s*true,\s*role:\s*true/);
    assert.doesNotMatch(route, /passwordHash/);
    assert.match(route, /admin\.staff\.lastAdminGuard/);
    assert.match(route, /z\.enum\(ASSIGNABLE_ROLES\)/);
    for (const role of ASSIGNABLE_USER_ROLES) {
      assert.match(route, new RegExp(`"${role}"`));
    }
  });

  it("staff page uses tr() for role labels and PATCH updates", () => {
    const page = buildCanonicalStaffDashboardPage();
    assert.match(page, /from\s+["']@\/lib\/i18n["']/);
    assert.match(page, /\btr\(/);
    assert.match(page, /admin\.staff\.title/);
    assert.match(page, /method:\s*["']PATCH["']/);
    assert.doesNotMatch(page, /"Admin"|\"Manager\"/);
  });

  it("auth scaffolds include staff API + page and staff-aware nav", () => {
    const files = hardenGeneratedWebApp(
      buildWebAppScaffold({
        requiresAuth: true,
        requiresDatabase: true,
        requiresDashboard: true,
        tables: ["Contact"],
      }),
    );
    const api = files.find((f) => f.path === "app/api/admin/users/route.ts");
    const page = files.find((f) => f.path === "app/dashboard/admin/staff/page.tsx");
    const layout = files.find((f) => f.path === "app/dashboard/layout.tsx");
    assert.ok(api);
    assert.ok(page);
    assert.ok(layout);
    assert.match(layout!.content, /isStaffRole/);
    assert.match(layout!.content, /\/dashboard\/admin\/staff/);
    assert.match(layout!.content, /admin\.staff\.nav/);
  });

  it("apps without auth do not ship staff management", () => {
    const files = buildWebAppScaffold({
      requiresAuth: false,
      requiresDatabase: true,
      tables: ["Item"],
    });
    assert.equal(
      files.some((f) => f.path === "app/api/admin/users/route.ts"),
      false,
    );
    assert.equal(
      files.some((f) => f.path === "app/dashboard/admin/staff/page.tsx"),
      false,
    );
  });
});
