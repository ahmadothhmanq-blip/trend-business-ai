/**
 * Deterministic gap-fill for App Builder — inject scaffold templates for
 * missing production paths so DeepSeek never repairs CRUD/toolchain files.
 *
 * Also re-syncs prisma schema + entity CRUD routes/pages so TypeScript build
 * never sees API delegates missing from PrismaClient.
 */

import {
  businessEntityTables,
  prismaClientDelegate,
  toPrismaModelName,
} from "@/lib/ai/webapp-domain-scaffold";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  buildWebAppScaffold,
  type WebAppScaffoldOptions,
} from "@/lib/ai/webapp-scaffold";
import { entitySlug } from "@/lib/ai/webapp-requirements";

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function schemaCoversTables(schema: string, tables: string[]): boolean {
  for (const table of businessEntityTables(tables)) {
    const model = toPrismaModelName(table);
    if (!new RegExp(`\\bmodel\\s+${model}\\b`).test(schema)) {
      return false;
    }
  }
  return true;
}

function isEntityCrudApiPath(path: string, tables: string[]): boolean {
  return businessEntityTables(tables).some(
    (table) => path === `app/api/${entitySlug(table)}/route.ts`,
  );
}

function isEntityDashboardPagePath(path: string, tables: string[]): boolean {
  return businessEntityTables(tables).some(
    (table) => path === `app/dashboard/${entitySlug(table)}/page.tsx`,
  );
}

function apiUsesExpectedDelegate(content: string, table: string): boolean {
  const delegate = prismaClientDelegate(toPrismaModelName(table));
  return new RegExp(`\\bdb\\.${delegate}\\b`).test(content);
}

function shouldReplaceScaffoldOwnedFile(
  path: string,
  existing: GeneratedProjectFile,
  scaffoldFile: GeneratedProjectFile,
  options: WebAppScaffoldOptions,
): boolean {
  const tables = options.tables ?? [];

  if (path === "prisma/schema.prisma" && (options.requiresDatabase || options.requiresAuth)) {
    if (options.requiresAuth) {
      if (
        !/\bpasswordHash\b/.test(existing.content) ||
        !/\bmodel\s+Session\b/.test(existing.content)
      ) {
        return true;
      }
    }
    if (tables.length > 0 && !schemaCoversTables(existing.content, tables)) {
      return true;
    }
    const dataModels = options.dataModels ?? [];
    for (const model of dataModels) {
      for (const field of model.fields) {
        const name = field.name.trim();
        if (!name) continue;
        if (["id", "createdAt", "updatedAt"].includes(name)) continue;
        if (!new RegExp(`\\b${name}\\b`).test(existing.content)) {
          return true;
        }
      }
    }
    return false;
  }

  if (path === "lib/auth.ts" && options.requiresAuth) {
    return (
      !/userId\s*:\s*string/.test(existing.content) ||
      !/db\.session/.test(existing.content)
    );
  }

  if (path === "app/api/auth/login/route.ts" && options.requiresAuth) {
    return !/verifyPassword/.test(existing.content);
  }

  if (path === "app/api/auth/signup/route.ts" && options.requiresAuth) {
    return !/hashPassword/.test(existing.content);
  }

  if (isEntityCrudApiPath(path, tables)) {
    const table = businessEntityTables(tables).find(
      (name) => path === `app/api/${entitySlug(name)}/route.ts`,
    );
    if (!table) return false;
    return (
      existing.content !== scaffoldFile.content ||
      !apiUsesExpectedDelegate(existing.content, table)
    );
  }

  if (isEntityDashboardPagePath(path, tables)) {
    return existing.content !== scaffoldFile.content;
  }

  return false;
}

export type ScaffoldGapResult = {
  files: GeneratedProjectFile[];
  injectedPaths: string[];
  replacedPaths: string[];
  scaffoldPaths: Set<string>;
};

/**
 * Upsert every scaffold path that is missing from the project.
 * Refresh prisma schema + entity CRUD when they drift from canonical tables
 * (the failure mode that previously sent 8 DeepSeek repairs and broke `tsc`).
 */
export function applyDeterministicScaffoldGaps(
  files: GeneratedProjectFile[],
  options: WebAppScaffoldOptions,
): ScaffoldGapResult {
  const scaffold = buildWebAppScaffold(options);
  const scaffoldPaths = new Set(scaffold.map((file) => normalizePath(file.path)));
  const byPath = new Map(
    files.map((file) => [normalizePath(file.path), { ...file, path: normalizePath(file.path) }]),
  );
  const injectedPaths: string[] = [];
  const replacedPaths: string[] = [];

  for (const scaffoldFile of scaffold) {
    const path = normalizePath(scaffoldFile.path);
    const existing = byPath.get(path);

    if (!existing) {
      byPath.set(path, { ...scaffoldFile, path });
      injectedPaths.push(path);
      continue;
    }

    if (shouldReplaceScaffoldOwnedFile(path, existing, scaffoldFile, options)) {
      byPath.set(path, { ...scaffoldFile, path });
      replacedPaths.push(path);
    }
  }

  return {
    files: [...byPath.values()],
    injectedPaths,
    replacedPaths,
    scaffoldPaths,
  };
}

/** True when a repair target is owned by the deterministic scaffold. */
export function isDeterministicScaffoldRepairTarget(
  targetPath: string,
  scaffoldPaths: Iterable<string>,
): boolean {
  const normalized = normalizePath(targetPath);
  for (const path of scaffoldPaths) {
    if (normalizePath(path) === normalized) return true;
  }
  return false;
}
