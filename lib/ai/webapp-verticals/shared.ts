/**
 * Shared helpers for vertical ZIP scaffold overlays.
 */

import type { AppDataModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export function findDataModel(
  dataModels: AppDataModel[] | undefined,
  name: string,
): AppDataModel | undefined {
  return (dataModels ?? []).find(
    (model) => model.name.trim().toLowerCase() === name.toLowerCase(),
  );
}

export function modelNames(dataModels: AppDataModel[] | undefined): Set<string> {
  return new Set(
    (dataModels ?? []).map((model) => model.name.trim().toLowerCase()),
  );
}

export function upsertFile(
  files: GeneratedProjectFile[],
  file: GeneratedProjectFile,
): GeneratedProjectFile[] {
  const next = files.map((entry) => ({ ...entry }));
  const idx = next.findIndex((entry) => entry.path === file.path);
  if (idx >= 0) next[idx] = file;
  else next.push(file);
  return next;
}

export function attachPrismaSeed(
  files: GeneratedProjectFile[],
  seedContent: string,
  readmeSection: string,
): GeneratedProjectFile[] {
  let next = upsertFile(files, {
    path: "prisma/seed.ts",
    language: "typescript",
    content: seedContent,
  });

  const pkgIdx = next.findIndex((file) => file.path === "package.json");
  if (pkgIdx >= 0) {
    try {
      const pkg = JSON.parse(next[pkgIdx].content) as Record<string, unknown>;
      const scripts = {
        ...((pkg.scripts as Record<string, string> | undefined) ?? {}),
        "db:seed": "npx tsx prisma/seed.ts",
      };
      pkg.scripts = scripts;
      pkg.prisma = { seed: "npx tsx prisma/seed.ts" };
      next[pkgIdx] = {
        ...next[pkgIdx],
        content: `${JSON.stringify(pkg, null, 2)}\n`,
      };
    } catch {
      // keep package.json untouched
    }
  }

  const readmeIdx = next.findIndex((file) => file.path === "README.md");
  if (readmeIdx >= 0) {
    next[readmeIdx] = {
      ...next[readmeIdx],
      content: `${next[readmeIdx].content.trim()}\n\n${readmeSection.trim()}\n`,
    };
  }

  return next;
}

export function buildPrismaSeedShell(body: string): string {
  return `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
${body}
  console.log("Sample data seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
}
