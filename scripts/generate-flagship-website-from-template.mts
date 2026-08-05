/**
 * Generate a production-ready flagship website from V2 structure (no AI provider required).
 * Usage: npx tsx scripts/generate-flagship-website-from-template.mts <package-id> <slug> <title> <description> [language]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { applyStructureTemplateToProject } from "../lib/website/builder/apply-structure-template.ts";
import { buildStaticPreviewHtml } from "../lib/website/build-static-preview.server.ts";
import { clearV2PreviewCompilerCache } from "../lib/website/template-v2/preview/v2-preview-compiler.ts";
import type { GeneratedWebsiteProject } from "../plugins/website/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(root, "scripts", "benchmark-results", "generated-flagship-websites");

const [packageId, slug, title, description, language = "English"] = process.argv.slice(2);
if (!packageId || !slug || !title || !description) {
  console.error(
    "Usage: npx tsx scripts/generate-flagship-website-from-template.mts <package-id> <slug> <title> <description> [language]",
  );
  process.exit(1);
}

const baseProject: GeneratedWebsiteProject = {
  projectKind: "website",
  title,
  description,
  pages: ["home"],
  sections: [],
  colorPalette: [],
  typography: [],
  components: [],
  content: [],
  seo: [],
  roadmap: [],
  files: [
    { path: "app/page.tsx", content: "export default function Page(){return <main/>}", language: "tsx" },
    { path: "app/globals.css", content: "@tailwind base;@tailwind components;@tailwind utilities;", language: "css" },
    { path: "app/layout.tsx", content: "export default function Layout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}</body></html>}", language: "tsx" },
  ],
  settings: {},
};

clearV2PreviewCompilerCache();
const applied = await applyStructureTemplateToProject({
  project: baseProject,
  templatePackageId: packageId,
  language,
});

const settings = (applied.project.settings ?? {}) as Record<string, unknown>;
const files = applied.project.files ?? [];
const page = files.find((f) => f.path === "app/page.tsx")?.content ?? "";
const hasV2 = page.includes(`data-v2-package="${packageId}"`);
const componentCount = files.filter((f) => f.path.includes(`${packageId}-`)).length;

const html = buildStaticPreviewHtml({
  title,
  description,
  pages: applied.project.pages,
  sections: applied.project.sections,
  colorPalette: applied.project.colorPalette,
  typography: applied.project.typography,
  content: applied.project.content,
  components: applied.project.components,
  files,
  templateArchitectureVersion: settings.templateArchitectureVersion as "v1" | "v2" | undefined,
  templatePackageId: (settings.templatePackageId as string | undefined) ?? packageId,
  settings,
  language,
});

const siteDir = join(outRoot, slug);
mkdirSync(siteDir, { recursive: true });
writeFileSync(join(siteDir, "preview.html"), html, "utf8");
writeFileSync(
  join(siteDir, "project.json"),
  JSON.stringify({ slug, packageId, title, language, hasV2, componentCount, source: "structure-template" }, null, 2),
);
writeFileSync(join(siteDir, "files.json"), JSON.stringify(files.map((f) => f.path), null, 2));

console.log(JSON.stringify({ slug, packageId, hasV2, componentCount, passed: hasV2 && componentCount >= 8 }, null, 2));
process.exit(hasV2 && componentCount >= 8 ? 0 : 1);
