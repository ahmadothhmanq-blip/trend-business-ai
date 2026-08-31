/**
 * Verify deterministic App Builder scaffold typechecks (and optionally builds).
 * Usage:
 *   npx tsx scripts/verify-app-builder-scaffold-build.ts
 *   npx tsx scripts/verify-app-builder-scaffold-build.ts --build
 */
import { buildWebAppScaffold } from "@/lib/ai/webapp-scaffold";
import { hardenGeneratedWebApp } from "@/lib/ai/webapp-harden";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import { verifyWebAppProjectBuild } from "@/lib/ai/webapp-project-verify";
import type { AppDataModel } from "@/lib/ai-core/app-design-platform/types";

const withBuild = process.argv.includes("--build");

const dataModels: AppDataModel[] = [
  {
    id: "item",
    name: "Item",
    label: "Item",
    fields: [
      { name: "name", type: "string", required: true },
      { name: "sku", type: "string", required: true },
      { name: "quantity", type: "number", required: true },
    ],
    relations: [],
    crud: ["create", "read", "update", "delete", "list"],
  },
];

const scaffold = hardenGeneratedWebApp(
  buildWebAppScaffold({
    projectName: "Trust Verify Ops",
    requiresAuth: true,
    requiresDatabase: true,
    requiresDashboard: true,
    tables: ["Item"],
    dataModels,
  }),
);

const readiness = findWebAppReadinessIssues(scaffold, {
  requiresAuth: true,
  requiresDatabase: true,
});

if (readiness.length > 0) {
  console.error("Trust readiness failed:");
  for (const issue of readiness) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log(
  `Trust readiness OK · ${scaffold.length} files · verifying ${withBuild ? "install+prisma+typecheck+build" : "install+prisma+typecheck"}…`,
);

const result = verifyWebAppProjectBuild(scaffold, {
  steps: withBuild
    ? ["install", "prisma-generate", "typecheck", "build"]
    : ["install", "prisma-generate", "typecheck"],
  keepDir: process.argv.includes("--keep"),
});

for (const step of result.steps) {
  const mark = step.ok ? "✓" : "✗";
  console.log(
    `  ${mark} ${step.step} (${Math.round(step.durationMs / 1000)}s)${step.error ? `\n${step.error}` : ""}`,
  );
}

if (result.depCache) {
  console.log(
    `  dep-cache hash=${result.depCache.hash} hit=${result.depCache.cacheHit} skippedInstall=${result.depCache.installSkipped} installMs=${result.depCache.installDurationMs} linkMs=${result.depCache.linkDurationMs}${result.depCache.invalidationReason ? ` reason=${result.depCache.invalidationReason}` : ""}`,
  );
}

if (!result.ok) {
  console.error(`\nScaffold verify FAILED · dir=${result.dir}`);
  process.exit(1);
}

console.log(`\nScaffold verify PASS · cleaned=${result.cleaned}`);
process.exit(0);
