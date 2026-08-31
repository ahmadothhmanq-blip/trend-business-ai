import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { applyStructureTemplateToProject } from "../lib/website/builder/apply-structure-template.ts";
import { buildStaticPreviewHtml } from "../lib/website/build-static-preview.server.ts";

const baseProject = {
  projectKind: "website",
  title: "Northline Apparel",
  description: "Create a website for a clothing company.",
  pages: ["home"],
  sections: [],
  colorPalette: [],
  typography: [],
  components: [],
  content: [],
  seo: [],
  roadmap: [],
  files: [
    {
      path: "app/page.tsx",
      content: "export default function Page(){return <main/>}",
      language: "tsx",
    },
    {
      path: "app/globals.css",
      content: "@tailwind base;",
      language: "css",
    },
  ],
};

const applied = await applyStructureTemplateToProject({
  project: baseProject,
  templatePackageId: "corporate-business",
  language: "English",
});

const p = applied.project;
const html = buildStaticPreviewHtml({
  title: p.title,
  description: p.description,
  pages: p.pages,
  sections: p.sections,
  colorPalette: p.colorPalette,
  typography: p.typography,
  content: p.content,
  components: p.components,
  files: p.files,
  templateArchitectureVersion: p.settings?.templateArchitectureVersion,
  templatePackageId: p.settings?.templatePackageId,
  settings: p.settings,
  language: "English",
});

const err = html.match(/data-v2-preview-error="([^"]+)"/);
console.log(
  JSON.stringify({
    fileCount: p.files.length,
    pages: p.pages,
    previewError: err?.[1] ?? null,
    htmlLen: html.length,
    ok: !err && html.length > 5000,
  }),
);
