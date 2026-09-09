import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCanonicalAuthLoginRoute,
  buildCanonicalAuthLogoutRoute,
  buildCanonicalAuthModule,
  buildCanonicalAuthSignupRoute,
  buildCanonicalSessionCookieModule,
} from "@/lib/ai/webapp-auth-scaffold";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { buildCanonicalMiddleware } from "@/lib/ai/webapp-runtime-scaffold";
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import {
  signSessionCookie,
  verifySessionCookie,
} from "@/lib/ai/webapp-session-cookie";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";

describe("signed session middleware (P1-3)", () => {
  it("signs and verifies session cookies", async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const value = await signSessionCookie({
      token: "sid-1",
      userId: "user-1",
      role: "admin",
      expiresAt,
    });

    const claims = await verifySessionCookie(value);
    assert.deepEqual(claims, {
      sid: "sid-1",
      userId: "user-1",
      role: "admin",
    });
  });

  it("rejects forged, truncated, and empty cookies", async () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const value = await signSessionCookie({
      token: "sid-1",
      userId: "user-1",
      role: "user",
      expiresAt,
    });

    assert.equal(await verifySessionCookie(undefined), null);
    assert.equal(await verifySessionCookie(""), null);
    assert.equal(await verifySessionCookie("not-a-signed-cookie"), null);
    assert.equal(await verifySessionCookie(value.slice(0, -4) + "aaaa"), null);
    assert.equal(await verifySessionCookie(`forged.${value.split(".")[1]}`), null);
  });

  it("rejects expired session cookies", async () => {
    const value = await signSessionCookie({
      token: "sid-expired",
      userId: "user-1",
      role: "user",
      expiresAt: new Date(Date.now() - 1_000),
    });
    assert.equal(await verifySessionCookie(value), null);
  });

  it("scaffold middleware verifies signed cookies and never trusts session_role", () => {
    const middleware = buildCanonicalMiddleware();
    assert.match(middleware, /verifySessionCookie/);
    assert.match(middleware, /async function middleware/);
    assert.match(middleware, /\/api\/:path\*/);
    assert.match(middleware, /t\("middleware\.forbidden"\)/);
    assert.match(middleware, /STAFF_ROLES/);
    assert.doesNotMatch(middleware, /cookies\.get\(\s*["']session_role["']\s*\)/);
  });

  it("auth module verifies cookie before DB session lookup", () => {
    const auth = buildCanonicalAuthModule();
    assert.match(auth, /verifySessionCookie/);
    assert.match(auth, /where:\s*\{\s*token:\s*claims\.sid\s*\}/);
    assert.match(auth, /row\.userId !== claims\.userId/);
  });

  it("login and signup issue signed cookies; logout verifies then revokes", () => {
    assert.match(buildCanonicalAuthLoginRoute(), /signSessionCookie/);
    assert.doesNotMatch(buildCanonicalAuthLoginRoute(), /name:\s*"session_role"/);
    assert.match(buildCanonicalAuthSignupRoute(), /signSessionCookie/);
    assert.doesNotMatch(buildCanonicalAuthSignupRoute(), /name:\s*"session_role"/);
    assert.match(buildCanonicalAuthLogoutRoute(), /verifySessionCookie/);
    assert.match(buildCanonicalAuthLogoutRoute(), /claims\.sid/);
  });

  it("emits session-cookie module with sign and verify exports", () => {
    const moduleSource = buildCanonicalSessionCookieModule();
    assert.match(moduleSource, /export async function signSessionCookie/);
    assert.match(moduleSource, /export async function verifySessionCookie/);
    assert.match(moduleSource, /crypto\.subtle/);
  });

  it("readiness rejects cookie-presence-only middleware", () => {
    const cookieOnly = `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const role = request.cookies.get("session_role")?.value ?? "";
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.next();
}
`;
    const issues = findWebAppReadinessIssues(
      [
        {
          path: "app/login/page.tsx",
          language: "tsx",
          content: "export default function Page(){return null}",
        },
        {
          path: "middleware.ts",
          language: "typescript",
          content: cookieOnly,
        },
      ],
      { requiresAuth: true },
    );
    assert.ok(
      issues.some((issue) => issue.includes("verifySessionCookie")),
      issues.join("\n"),
    );
  });

  it("hardened scaffold passes readiness with verified sessions", () => {
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

    const middleware = hardened.find((file) => file.path === "middleware.ts");
    assert.ok(middleware);
    assert.match(middleware!.content, /verifySessionCookie/);

    const sessionCookie = hardened.find(
      (file) => file.path === "lib/session-cookie.ts",
    );
    assert.ok(sessionCookie);
  });
});
