import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from "../../lib/website/builder/apply-structure-template.ts";
import { buildStaticPreviewHtml } from "../../lib/website/build-static-preview.server.ts";
import { clearV2PreviewCompilerCache } from "../../lib/website/template-v2/preview/v2-preview-compiler.ts";
import type { GeneratedWebsiteProject } from "../../plugins/website/types.ts";

const root = join(import.meta.dirname, "..", "..");
const outRoot = join(root, "scripts", "benchmark-results", "flagship-previews");
mkdirSync(outRoot, { recursive: true });

const templates = [
  { id: "saas-enterprise", title: "Northline", description: "Enterprise revenue operations platform" },
  { id: "corporate-business", title: "Meridian Advisory", description: "Executive advisory for global enterprises" },
  { id: "restaurant-premium", title: "Ember Table", description: "Contemporary fine dining" },
  { id: "ecommerce-premium", title: "Atelier", description: "Curated commerce and artisan objects" },
  { id: "medical-premium", title: "Serenity Clinical", description: "Private healthcare network" },
  { id: "real-estate-premium", title: "Monolith Estate", description: "Luxury real estate collection" },
] as const;

const baseProject = {
  projectKind: "website",
  title: "Preview",
  description: "Flagship preview",
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
} satisfies GeneratedWebsiteProject;

clearV2PreviewCompilerCache();
const report = [];

for (const tpl of templates) {
  clearV2PreviewCompilerCache();
  const applied = await applyStructureTemplateToProject({
    project: { ...baseProject, title: tpl.title, description: tpl.description },
    templatePackageId: tpl.id,
    language: "English",
  });
  const settings = (applied.project.settings ?? {}) as Record<string, unknown>;
  const html = buildStaticPreviewHtml({
    title: tpl.title,
    description: tpl.description,
    pages: applied.project.pages,
    sections: applied.project.sections,
    colorPalette: applied.project.colorPalette,
    typography: applied.project.typography,
    content: applied.project.content,
    components: applied.project.components,
    files: applied.project.files,
    templateArchitectureVersion: settings.templateArchitectureVersion as "v1" | "v2" | undefined,
    templatePackageId: (settings.templatePackageId as string | undefined) ?? tpl.id,
    settings,
    language: "English",
  });
  const dir = join(outRoot, tpl.id);
  mkdirSync(dir, { recursive: true });
  const previewPath = join(dir, "preview.html");
  writeFileSync(previewPath, html, "utf8");
  const hasImages = html.includes("images.unsplash.com");
  report.push({
    id: tpl.id,
    bytes: Buffer.byteLength(html),
    hasImages,
    hasHero: html.includes(`data-v2-component="${tpl.id}-hero"`),
    v2: html.includes('data-v2-render="v2-files"'),
  });
}

writeFileSync(
  join(outRoot, "index.html"),
  `<!DOCTYPE html><html><head><meta charset=utf-8><title>Flagship Previews</title></head><body><h1>Flagship previews</h1><ul>${report.map((r) => `<li><a href="./${r.id}/preview.html">${r.id}</a> — ${(r.bytes / 1024).toFixed(0)}KB — images:${r.hasImages}</li>`).join("")}</ul></body></html>`,
  "utf8",
);
console.log(JSON.stringify(report, null, 2));
