import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
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
  const previousFlag = process.env.WB_STRUCTURE_FIRST;

  before(() => {
    delete process.env.WB_STRUCTURE_FIRST;
  });

  after(() => {
    if (previousFlag === undefined) {
      delete process.env.WB_STRUCTURE_FIRST;
    } else {
      process.env.WB_STRUCTURE_FIRST = previousFlag;
    }
  });

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

    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.ok(html.includes('data-v2-package="restaurant-signature"'));
    assert.ok(html.includes('data-v2-layout="default"'));
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
    assert.ok(html.includes("--color-primary: #4338CA"));
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

    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.ok(html.includes('data-v2-package="real-estate-prestige"'));
    assert.ok(html.includes('data-v2-layout="default"'));
    assert.ok(html.includes('data-v2-component="real-estate-prestige-hero"'));
    assert.ok(!html.includes("ThemeCorporate"));
    assert.ok(!html.includes("ThemeLuxury"));
    assert.ok(html.includes("--color-primary: #0E0D0B"));
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

    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.ok(html.includes('data-v2-package="medical-premium"'));
    assert.ok(html.includes('data-v2-layout="default"'));
    assert.ok(html.includes('data-v2-component="medical-premium-hero"'));
    assert.ok(!html.includes("ThemeMinimal"));
    assert.ok(!html.includes("ThemeCorporate"));
    assert.ok(html.includes("--color-primary: #1B4D48"));
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

    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.ok(html.includes('data-v2-package="creative-portfolio"'));
    assert.ok(html.includes('data-v2-layout="default"'));
    assert.ok(html.includes('data-v2-component="creative-portfolio-hero"'));
    assert.ok(!html.includes("ThemeCreative"));
    assert.ok(!html.includes("ThemeMinimal"));
    assert.ok(html.includes("--color-primary: #09090B"));
  });

  it("keeps modern-business on V2 corporate-business preview path", async () => {
    const applied = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "modern-business",
      language: "English",
    });

    const html = buildStaticPreviewHtml(
      previewInputFromProject(applied.project, "English"),
    );

    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.ok(html.includes('data-v2-package="corporate-business"'));
    assert.ok(html.includes('data-v2-component="corporate-business-hero"'));
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

  it("keeps module-local helpers (resolveLinks) in scope during Preview compile", async () => {
    const applied = await applyStructureTemplateToProject({
      project: baseProject,
      templatePackageId: "ai-startup-signal",
      language: "English",
    });

    const html = buildStaticPreviewHtml(
      previewInputFromProject(applied.project, "English"),
    );

    assert.ok(html.includes('data-v2-render="v2-files-6"'));
    assert.ok(html.includes('data-v2-package="ai-startup-signal"'));
    assert.ok(html.includes('data-v2-component="ai-startup-signal-footer"'));
    assert.ok(!html.includes("data-v2-preview-error="));
    assert.ok(!/resolveLinks is not defined/i.test(html));
  });
});

describe("project files preview (no template)", () => {
  beforeEach(() => {
    clearV2PreviewCompilerCache();
  });

  it("renders TBGE home from app/page.tsx instead of TI HeroSplit fallback", () => {
    const brand = "شركة مفروشات الرياض";
    const html = buildStaticPreviewHtml({
      title: brand,
      description: "أثاث منزلي وغرف نوم",
      pages: ["الرئيسية", "من نحن"],
      language: "Arabic",
      files: [
        {
          path: "app/page.tsx",
          content: [
            'import { SiteShell } from "@/components/layout/site-shell";',
            'import { Button } from "@/components/ui/button";',
            "",
            "export default function HomePage() {",
            "  return (",
            "    <SiteShell>",
            `      <h1>${brand}</h1>`,
            "      <p>أثاث منزلي فاخر</p>",
            "      <Button>اطلب عرض سعر</Button>",
            "    </SiteShell>",
            "  );",
            "}",
          ].join("\n"),
          language: "tsx",
        },
        {
          path: "components/layout/site-shell.tsx",
          content: `export function SiteShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-slate-900">{children}</div>;
}`,
          language: "tsx",
        },
        {
          path: "components/ui/button.tsx",
          content: `export function Button({ children }: { children: React.ReactNode }) {
  return <button className="rounded bg-slate-900 px-4 py-2 text-white">{children}</button>;
}`,
          language: "tsx",
        },
        {
          path: "app/globals.css",
          content: "@tailwind base;",
          language: "css",
        },
      ],
    });

    assert.ok(html.includes('data-project-files-render="project-files-1"'));
    assert.ok(html.includes(brand));
    assert.ok(!html.includes('data-ti-template="'));
    assert.ok(!html.includes("ti-hero--saas-split"));
    assert.ok(!html.includes("HeroSplit"));
  });
});
