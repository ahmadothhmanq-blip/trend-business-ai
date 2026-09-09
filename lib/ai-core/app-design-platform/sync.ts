/**
 * Bidirectional sync: StructuredAppModel → generated project files.
 * Screen titles resolve through t()/te() — never bake template English labels.
 */

import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { brandTokensToCssVars } from "@/lib/ai-core/app-design-platform/brand";
import { toPrismaSchemaSketch } from "@/lib/ai-core/app-design-platform/data";
import { resolveAppScreenDisplayRef } from "@/lib/ai/webapp-i18n/localize-template";
import { mergeMobileStoreIntoProjectFiles } from "@/lib/ai/webapp-mobile-store";

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

function screenPageContent(
  screen: StructuredAppModel["screens"][0],
  model: StructuredAppModel,
): string {
  const comps = model.components
    .filter((c) => c.screenId === screen.id)
    .map((c) => `      <${pascalCase(c.type)} {...${JSON.stringify(c.props)}} />`)
    .join("\n");

  const display = resolveAppScreenDisplayRef(screen);
  const titleExpr =
    display.kind === "entity"
      ? `te(${JSON.stringify(display.key)})`
      : `t(${JSON.stringify(display.key)})`;

  const isDashboard =
    /^(dashboard|overview|home)$/i.test(screen.name.trim()) ||
    /^\/?(dashboard|home)?$/i.test(screen.path);
  const subtitle = isDashboard
    ? `      <p className="text-muted-foreground">{t("dashboard.overviewSubtitle")}</p>`
    : "";

  return `import { t, te } from "@/lib/i18n";

export default function Page() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{${titleExpr}}</h1>
${subtitle}
${comps || "      <p>{t(\"dashboard.emptyHint\")}</p>"}
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
    const routePath =
      screen.path === "/" ? "app/page.tsx" : `app${screen.path}/page.tsx`;
    const exists = next.some(
      (f) => f.path.replaceAll("\\", "/") === routePath,
    );
    // Keep previously generated pages when deploying, to avoid overwriting
    // App Builder's compiled page implementations with preview stubs.
    if (!exists) {
      next = upsertFile(
        next,
        routePath,
        screenPageContent(screen, model),
        "typescript",
      );
      updatedPaths.push(routePath);
    }
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

  notes.push(
    `Synced ${model.screens.length} screens, ${model.components.length} components, ${model.dataModels.length} data models.`,
  );

  next = mergeMobileStoreIntoProjectFiles(next, {
    title: model.settings.appName,
    primaryColor: model.brand.tokens.primary,
  });
  notes.push("Mobile store packaging (PWA, Capacitor, Google Play TWA) included.");

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
