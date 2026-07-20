/**
 * Bidirectional sync: StructuredAppModel → generated project files.
 */

import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { brandTokensToCssVars } from "@/lib/ai-core/app-design-platform/brand";
import { toPrismaSchemaSketch } from "@/lib/ai-core/app-design-platform/data";

export type AppSyncResult = {
  files: GeneratedProjectFile[];
  updatedPaths: string[];
  notes: string[];
};

function upsertFile(
  files: GeneratedProjectFile[],
  path: string,
  content: string,
  language = "typescript",
): GeneratedProjectFile[] {
  const norm = path.replaceAll("\\", "/");
  const idx = files.findIndex((f) => f.path.replaceAll("\\", "/") === norm);
  const entry: GeneratedProjectFile = { path: norm, content, language };
  if (idx >= 0) {
    return files.map((f, i) => (i === idx ? entry : f));
  }
  return [...files, entry];
}

function screenPageContent(screen: StructuredAppModel["screens"][0], model: StructuredAppModel): string {
  const comps = model.components
    .filter((c) => c.screenId === screen.id)
    .map((c) => `      <${pascalCase(c.type)} {...${JSON.stringify(c.props)}} />`)
    .join("\n");

  return `export default function Page() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">${escapeTs(screen.name)}</h1>
      <p className="text-muted-foreground">${escapeTs(screen.purpose)}</p>
${comps || "      <p>Screen content</p>"}
    </main>
  );
}
`;
}

function pascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("") || "Component";
}

function escapeTs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

/** Sync model changes into blueprint source files. */
export function syncAppModelToFiles(
  model: StructuredAppModel,
  files: GeneratedProjectFile[] = [],
): AppSyncResult {
  let next = [...files];
  const updatedPaths: string[] = [];
  const notes: string[] = [];

  const cssVars = brandTokensToCssVars(model.brand.tokens);
  const globalsCss = `:root {\n${cssVars}\n}\n`;
  next = upsertFile(next, "app/globals.css", globalsCss, "css");
  updatedPaths.push("app/globals.css");

  for (const screen of model.screens) {
    const routePath = screen.path === "/" ? "app/page.tsx" : `app${screen.path}/page.tsx`;
    next = upsertFile(next, routePath, screenPageContent(screen, model), "typescript");
    updatedPaths.push(routePath);
  }

  const catalogJson = JSON.stringify(model.catalog, null, 2);
  next = upsertFile(
    next,
    "lib/app-data.ts",
    `/** Auto-synced from App Builder model */\nexport const APP_CATALOG = ${catalogJson} as const;\n\nexport const APP_NAME = ${JSON.stringify(model.settings.appName)};\n`,
    "typescript",
  );
  updatedPaths.push("lib/app-data.ts");

  const prisma = toPrismaSchemaSketch(model);
  next = upsertFile(next, "prisma/schema.prisma", prisma, "prisma");
  updatedPaths.push("prisma/schema.prisma");

  const previewHtml = `<!-- synced preview stub — use /api/webapp-builder/[id]/live-preview -->`;
  next = upsertFile(next, "preview/index.html", previewHtml, "html");
  updatedPaths.push("preview/index.html");

  notes.push(`Synced ${model.screens.length} screens, ${model.components.length} components, ${model.dataModels.length} data models.`);

  return { files: next, updatedPaths, notes };
}

/** Merge sync result back into blueprint pages list. */
export function syncPagesFromModel(model: StructuredAppModel) {
  return model.screens.map((s) => ({
    name: s.name,
    path: s.path,
    description: s.purpose,
  }));
}
