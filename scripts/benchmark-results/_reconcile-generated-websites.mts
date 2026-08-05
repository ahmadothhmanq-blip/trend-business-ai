import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { applyStructureTemplateToProject } from "../../lib/website/builder/apply-structure-template.ts";
import {
  buildStaticPreviewHtml,
  ensureStaticPreviewFile,
} from "../../lib/website/build-static-preview.server.ts";
import { clearV2PreviewCompilerCache } from "../../lib/website/template-v2/preview/v2-preview-compiler.ts";
import type { GeneratedWebsiteProject } from "../../plugins/website/types.ts";

const root = join(import.meta.dirname, "..", "..");
const outRoot = join(root, "scripts", "benchmark-results", "generated-flagship-websites");
const flagshipRoot = join(root, "scripts", "benchmark-results", "flagship-previews");

const specs = [
  { slug: "corporate-ai-en", templateId: "corporate-business", language: "English" },
  { slug: "restaurant-ar", templateId: "restaurant-premium", language: "Arabic" },
  { slug: "saas-pm-fr", templateId: "saas-enterprise", language: "French" },
] as const;

function analyze(html: string) {
  return {
    imageCount: (html.match(/images\.unsplash\.com/g) ?? []).length,
    hasHeroImage: /<img[^>]+fetchPriority="high"/i.test(html),
    hasPlaceholder: /placeholder|lorem ipsum|professional presence/i.test(html),
    hasRtl: /dir="rtl"/i.test(html),
    isFrench: /gestion de projet|plateforme|tarification|démo|réserver/i.test(html),
    isArabic: /[\u0600-\u06FF]{12,}/.test(html),
    hasEnglishLeak: /Get started|Learn more|Northline|Meridian Advisory|Ember Table|Strategy and execution for the enterprise/i.test(html),
    components: [...new Set([...html.matchAll(/data-v2-component="([^"]+)"/g)].map((m) => m[1]))].sort(),
  };
}

const summary = [];

for (const spec of specs) {
  const project = JSON.parse(
    readFileSync(join(outRoot, spec.slug, "project.json"), "utf8"),
  ) as GeneratedWebsiteProject;

  clearV2PreviewCompilerCache();
  const applied = await applyStructureTemplateToProject({
    project,
    templatePackageId: spec.templateId,
    language: spec.language,
  });

  const updated = applied.project;
  const settings = (updated.settings ?? {}) as Record<string, unknown>;

  const files = ensureStaticPreviewFile({
    title: updated.title,
    description: updated.description,
    pages: updated.pages,
    sections: updated.sections,
    colorPalette: updated.colorPalette,
    typography: updated.typography,
    content: updated.content,
    components: updated.components,
    files: updated.files,
    templateArchitectureVersion: settings.templateArchitectureVersion as "v1" | "v2" | undefined,
    templatePackageId: (settings.templatePackageId as string) ?? spec.templateId,
    settings,
    language: spec.language,
  });

  const previewHtml =
    files.find((f) => f.path.replaceAll("\\", "/") === "preview/index.html")?.content ??
    buildStaticPreviewHtml({
      title: updated.title ?? "",
      description: updated.description,
      pages: updated.pages,
      sections: updated.sections,
      colorPalette: updated.colorPalette,
      typography: updated.typography,
      content: updated.content,
      components: updated.components,
      files: updated.files,
      templateArchitectureVersion: "v2",
      templatePackageId: spec.templateId,
      settings,
      language: spec.language,
    });

  const dir = join(outRoot, spec.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "preview.html"), previewHtml, "utf8");
  writeFileSync(join(dir, "project.json"), JSON.stringify({ ...updated, files }, null, 2), "utf8");

  const flagshipHtml = readFileSync(join(flagshipRoot, spec.templateId, "preview.html"), "utf8");
  const generated = analyze(previewHtml);
  const flagship = analyze(flagshipHtml);
  const missing = flagship.components.filter((c) => !generated.components.includes(c));
  const regressions: string[] = [];
  if (missing.length) regressions.push(`Missing components: ${missing.join(", ")}`);
  if (!generated.hasHeroImage) regressions.push("Missing hero image");
  if (generated.hasPlaceholder) regressions.push("Placeholder copy detected");
  if (spec.language === "Arabic" && !generated.hasRtl) regressions.push("RTL missing");
  if (spec.language === "French" && !generated.isFrench) regressions.push("French copy missing");
  if (spec.language !== "English" && generated.hasEnglishLeak) {
    const heroNavOnly = previewHtml.slice(0, previewHtml.indexOf('data-v2-region="main"'));
    const leakInChrome = /Get started|Learn more|Northline|Meridian Advisory|Ember Table/i.test(heroNavOnly);
    if (leakInChrome) regressions.push("English leak in nav/hero chrome");
  }

  summary.push({ slug: spec.slug, generated, missing, regressions, passed: regressions.length === 0 });
}

writeFileSync(join(outRoot, "reconcile-summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
