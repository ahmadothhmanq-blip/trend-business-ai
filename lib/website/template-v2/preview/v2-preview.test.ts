import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { buildStaticPreviewHtml } from "@/lib/website/build-static-preview.server";
import { applyStructureTemplateToProject } from "@/lib/website/builder/apply-structure-template";
import { clearV2PreviewCompilerCache } from "@/lib/website/template-v2/preview/v2-preview-compiler";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

const baseProject: GeneratedWebsiteProject = {
  projectKind: "website",
  title: "Maison Verdant",
  description: "Fine dining experience",
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
      content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;",
      language: "css",
    },
  ],
};

function previewInputFromProject(
  project: GeneratedWebsiteProject,
  language = "English",
) {
  const settings = (project.settings ?? {}) as Record<string, unknown>;
  return {
    title: project.title,
    description: project.description,
    pages: project.pages,
    sections: project.sections,
    colorPalette: project.colorPalette,
    typography: project.typography,
    content: project.content,
    components: project.components,
    files: project.files,
    templateArchitectureVersion: settings.templateArchitectureVersion as
      | "v1"
      | "v2"
      | undefined,
    templatePackageId: settings.templatePackageId as string | undefined,
    settings,
    language,
  };
}

describe("V2 preview engine integration", () => {
  beforeEach(() => {
    clearV2PreviewCompilerCache();
  });

  it("renders restaurant-signature from project.files with V2 markers", async () => {
    const applied = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "restaurant-signature",
      language: "English",
    });

    const html = buildStaticPreviewHtml(
      previewInputFromProject(applied.project, "English"),
    );

    assert.ok(html.includes('data-v2-render="v2-files"'));
    assert.ok(html.includes('data-v2-package="restaurant-signature"'));
    assert.ok(html.includes('data-v2-layout="sidebar-left"'));
    assert.ok(html.includes('data-v2-component="restaurant-signature-hero"'));
    assert.ok(!html.includes("ThemeLuxury"));
    assert.ok(!html.includes("ThemeCorporate"));
    assert.ok(!html.includes("ThemeTech"));
    assert.ok(!html.includes('data-ti-render="v5"'));
    assert.ok(html.includes("--color-primary: #1A3D32"));
    assert.ok(html.includes("cdn.tailwindcss.com"));
  });

  it("renders saas-enterprise from project.files without Theme* leak", async () => {
    const applied = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "saas-enterprise",
      language: "English",
    });

    const html = buildStaticPreviewHtml(
      previewInputFromProject(applied.project, "English"),
    );

    assert.ok(html.includes('data-v2-package="saas-enterprise"'));
    assert.ok(html.includes('data-v2-component="saas-enterprise-hero"'));
    assert.ok(!html.includes("ThemeBold"));
    assert.ok(!html.includes("ThemeCorporate"));
    assert.ok(html.includes("--color-primary: #1D4ED8"));
  });

  it("renders real-estate-prestige from project.files with V2 markers", async () => {
    const applied = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "real-estate-prestige",
      language: "English",
    });

    const html = buildStaticPreviewHtml(
      previewInputFromProject(applied.project, "English"),
    );

    assert.ok(html.includes('data-v2-render="v2-files"'));
    assert.ok(html.includes('data-v2-package="real-estate-prestige"'));
    assert.ok(html.includes('data-v2-layout="sidebar-right"'));
    assert.ok(html.includes('data-v2-component="real-estate-prestige-hero"'));
    assert.ok(!html.includes("ThemeCorporate"));
    assert.ok(!html.includes("ThemeLuxury"));
    assert.ok(html.includes("--color-primary: #1C1917"));
  });

  it("renders medical-premium from project.files with V2 markers", async () => {
    const applied = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "medical-premium",
      language: "English",
    });

    const html = buildStaticPreviewHtml(
      previewInputFromProject(applied.project, "English"),
    );

    assert.ok(html.includes('data-v2-render="v2-files"'));
    assert.ok(html.includes('data-v2-package="medical-premium"'));
    assert.ok(html.includes('data-v2-layout="full-bleed"'));
    assert.ok(html.includes('data-v2-component="medical-premium-trust-hero"'));
    assert.ok(!html.includes("ThemeMinimal"));
    assert.ok(!html.includes("ThemeCorporate"));
    assert.ok(html.includes("--color-primary: #1A4D4A"));
  });

  it("renders creative-portfolio from project.files with V2 markers", async () => {
    const applied = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "creative-portfolio",
      language: "English",
    });

    const html = buildStaticPreviewHtml(
      previewInputFromProject(applied.project, "English"),
    );

    assert.ok(html.includes('data-v2-render="v2-files"'));
    assert.ok(html.includes('data-v2-package="creative-portfolio"'));
    assert.ok(html.includes('data-v2-layout="editorial-reveal"'));
    assert.ok(html.includes('data-v2-component="creative-portfolio-hero"'));
    assert.ok(html.includes('data-v2-component="creative-portfolio-overlay-showcase"'));
    assert.ok(!html.includes("ThemeCreative"));
    assert.ok(!html.includes("ThemeMinimal"));
    assert.ok(html.includes("--color-primary: #09090B"));
  });

  it("keeps modern-business on V1 theme preview path", async () => {
    const applied = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "modern-business",
      language: "English",
    });

    const html = buildStaticPreviewHtml(
      previewInputFromProject(applied.project, "English"),
    );

    assert.ok(html.includes('data-ti-render="v5"'));
    assert.ok(html.includes('data-component="ThemeCorporateNav"'));
    assert.ok(!html.includes('data-v2-render="v2-files"'));
    assert.ok(!html.includes('data-v2-package="modern-business"'));
  });

  it("applies RTL for restaurant-signature Arabic preview", async () => {
    const applied = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "restaurant-signature",
      language: "Arabic",
    });

    const html = buildStaticPreviewHtml(
      previewInputFromProject(applied.project, "Arabic"),
    );

    assert.ok(html.includes('dir="rtl"'));
    assert.ok(
      html.includes('data-v2-component="restaurant-signature-hero"') ||
        html.includes('data-v2-package="restaurant-signature"'),
    );
    assert.ok(
      html.includes('[dir="rtl"]') ||
        html.includes("Noto Sans Arabic") ||
        html.includes("Noto Naskh Arabic") ||
        html.includes("Amiri") ||
        html.includes("Design Platform RTL"),
    );
  });
});
