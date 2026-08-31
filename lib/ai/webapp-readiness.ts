/**
 * Trust readiness gate — fail delivery when auth/schema contracts are still fake
 * or incomplete. Complements validateWebAppProject path checks.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  findAuthContractIssues,
  findWebAppTypeScriptContractIssues,
} from "@/lib/ai/webapp-harden";
import { normalizePath } from "@/lib/ai/webapp-harden-shared";

export type WebAppReadinessFlags = {
  requiresAuth?: boolean;
  requiresDatabase?: boolean;
};

function fileByPath(
  files: GeneratedProjectFile[],
  path: string,
): GeneratedProjectFile | undefined {
  return files.find((file) => normalizePath(file.path) === path);
}

function isFakeLoginRoute(content: string): boolean {
  const setsCookie = /jar\.set\s*\(\s*\{[^}]*name:\s*["']session["']/.test(content);
  const verifies = /verifyPassword/.test(content);
  const looksUpUser = /db\.user\.findUnique/.test(content);
  return setsCookie && (!verifies || !looksUpUser);
}

/**
 * Static trust checks for generated apps before they are treated as deliverable.
 */
export function findWebAppReadinessIssues(
  files: GeneratedProjectFile[],
  flags: WebAppReadinessFlags = {},
): string[] {
  const issues: string[] = [];
  const paths = new Set(files.map((file) => normalizePath(file.path)));
  const requiresAuth = Boolean(flags.requiresAuth) || paths.has("app/login/page.tsx");
  const requiresDatabase =
    Boolean(flags.requiresDatabase) ||
    paths.has("prisma/schema.prisma") ||
    requiresAuth;

  if (requiresAuth) {
    for (const required of [
      "lib/password.ts",
      "lib/auth.ts",
      "lib/db.ts",
      "app/api/auth/login/route.ts",
      "app/api/auth/signup/route.ts",
      "app/api/auth/logout/route.ts",
      "app/login/page.tsx",
      "app/signup/page.tsx",
      "middleware.ts",
      "prisma/schema.prisma",
    ]) {
      if (!paths.has(required)) {
        issues.push(`Missing trust-critical file: ${required}`);
      }
    }

    const login = fileByPath(files, "app/api/auth/login/route.ts");
    if (login && isFakeLoginRoute(login.content)) {
      issues.push(
        "app/api/auth/login/route.ts: login must verify passwordHash against User (reject any-password cookie sessions).",
      );
    }

    const signup = fileByPath(files, "app/api/auth/signup/route.ts");
    if (signup && !/hashPassword/.test(signup.content)) {
      issues.push(
        "app/api/auth/signup/route.ts: signup must hash passwords with hashPassword.",
      );
    }

    const password = fileByPath(files, "lib/password.ts");
    if (
      password &&
      (!/hashPassword/.test(password.content) || !/verifyPassword/.test(password.content))
    ) {
      issues.push(
        "lib/password.ts: must export hashPassword and verifyPassword (scrypt).",
      );
    }

    const schema = fileByPath(files, "prisma/schema.prisma");
    if (schema) {
      if (!/\bpasswordHash\b/.test(schema.content)) {
        issues.push("prisma/schema.prisma: User must include passwordHash.");
      }
      if (!/\bmodel\s+Session\b/.test(schema.content)) {
        issues.push("prisma/schema.prisma: Session model is required for DB-backed auth.");
      }
    }

    issues.push(...findAuthContractIssues(files));
  }

  if (requiresDatabase) {
    if (!paths.has("lib/db.ts")) {
      issues.push("Missing trust-critical file: lib/db.ts");
    }
    if (!paths.has("prisma/schema.prisma")) {
      issues.push("Missing trust-critical file: prisma/schema.prisma");
    }
  }

  issues.push(...findWebAppTypeScriptContractIssues(files));

  return [...new Set(issues)];
}

export function assertWebAppReady(
  files: GeneratedProjectFile[],
  flags: WebAppReadinessFlags = {},
): { ready: boolean; issues: string[] } {
  const issues = findWebAppReadinessIssues(files, flags);
  return { ready: issues.length === 0, issues };
}
