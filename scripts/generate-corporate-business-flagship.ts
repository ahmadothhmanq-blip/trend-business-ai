/**
 * Generate one Corporate Business V2 flagship website and verify output.
 * Usage: npx tsx scripts/generate-corporate-business-flagship.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { generateWebsite } from "@/lib/website-generator";
import { buildStaticPreviewHtml, ensureStaticPreviewFile } from "@/lib/website/build-static-preview.server";
import {
  projectContainsThemeComponents,
  projectUsesV2FlagshipComponents,
} from "@/lib/website/template-v2/generation/v2-generation-bridge";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts", "benchmark-results", "corporate-business-flagship");

const REQUIRED_SECTIONS = [
  "corporate-business-hero",
  "corporate-business-features",
  "corporate-business-about",
  "corporate-business-stats",
  "corporate-business-testimonials",
  "corporate-business-pricing",
  "corporate-business-faq",
  "corporate-business-utility-band",
  "corporate-business-contact",
  "corporate-business-footer",
] as const;

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

async function main() {
  if (!process.env.DEEPSEEK_API_KEY?.trim() && !process.env.OPENAI_API_KEY?.trim()) {
    console.error("FAIL: No AI provider API key (DEEPSEEK_API_KEY or OPENAI_API_KEY)");
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });

  const prompt =
    "Trend Business AI — an AI & software company building world-class business automation, " +
    "website generation, and enterprise AI products. Premium corporate presence with trust-first " +
    "messaging, executive advisory tone, measurable outcomes, and clear conversion paths.";

  console.log("Generating Corporate Business V2 flagship website…");
  const started = performance.now();

  const result = await generateWebsite({
    prompt,
    projectType: "business",
    projectKind: "website",
    language: "English",
    theme: "corporate",
    industryId: "ai-software",
    websiteStructureTemplateId: "corporate-business",
    templateId: "corporate-business",
    features: ["contact-form", "seo", "analytics"],
    generationProfile: "professional",
    autoFallback: true,
    userId: "flagship-corporate-gen",
    onProgress: (msg) => console.error(`[progress] ${msg}`),
  });

  const wallMs = Math.round(performance.now() - started);
  const settings = (result.settings ?? {}) as Record<string, unknown>;
  const packageId = "corporate-business";

  const files = ensureStaticPreviewFile({
    title: result.title || "Trend Business AI",
    description: result.description,
    pages: result.pages,
    sections: result.sections,
    colorPalette: result.colorPalette,
    typography: result.typography,
    content: result.content,
    components: result.components,
    files: result.files,
    templateIntelligenceId: settings.templateIntelligenceId as string | undefined,
    templateArchitectureVersion: settings.templateArchitectureVersion as "v1" | "v2" | undefined,
    templatePackageId: (settings.templatePackageId as string | undefined) ?? packageId,
    settings,
    language: "English",
  });

  const previewFile = files.find((f) => f.path.replaceAll("\\", "/") === "preview/index.html");
  const previewHtml =
    previewFile?.content ??
    buildStaticPreviewHtml({
      title: result.title,
      description: result.description,
      pages: result.pages,
      sections: result.sections,
      colorPalette: result.colorPalette,
      typography: result.typography,
      content: result.content,
      components: result.components,
      files: result.files,
      templateArchitectureVersion: "v2",
      templatePackageId: packageId,
      settings,
      language: "English",
    });

  const previewPath = join(outDir, "preview.html");
  writeFileSync(previewPath, previewHtml, "utf8");
  writeFileSync(join(outDir, "project.json"), JSON.stringify({ ...result, files }, null, 2), "utf8");

  const pageSource =
    result.files.find((f) => f.path.replaceAll("\\", "/") === "app/page.tsx")?.content ?? "";
  const allSource = result.files.map((f) => f.content).join("\n");

  const checks = {
    templateArchitectureVersion: settings.templateArchitectureVersion === "v2",
    templatePackageId: settings.templatePackageId === packageId,
    websiteStructureTemplateId: settings.websiteStructureTemplateId === packageId,
    presentationHash: Boolean(settings.templatePresentationHash),
    noThemeComponents: !projectContainsThemeComponents(result.files),
    usesV2Components: projectUsesV2FlagshipComponents(result.files, packageId),
    v2PreviewRenderer: previewHtml.includes('data-v2-render="v2-files"'),
    v2PackageMarker: previewHtml.includes(`data-v2-package="${packageId}"`),
    noThemePreview: !previewHtml.includes("ThemeCorporate") && !previewHtml.includes('data-ti-render="v5"'),
    noFallbackRenderer: !previewHtml.includes('data-ti-render="v2"'),
    sections: Object.fromEntries(
      REQUIRED_SECTIONS.map((id) => [
        id,
        pageSource.includes(id) || allSource.includes(`data-v2-component="${id}"`),
      ]),
    ),
  };

  const sectionOk = Object.values(checks.sections).every(Boolean);
  const allOk =
    checks.templateArchitectureVersion &&
    checks.templatePackageId &&
    checks.noThemeComponents &&
    checks.usesV2Components &&
    checks.v2PreviewRenderer &&
    checks.v2PackageMarker &&
    checks.noThemePreview &&
    sectionOk;

  const report = {
    generatedAt: new Date().toISOString(),
    company: "Trend Business AI",
    industry: "AI & Software Company",
    template: packageId,
    wallMs,
    generationTimeMs: result.generationTimeMs,
    fileCount: result.files.length,
    provider: result.provider,
    checks,
    allOk,
    previewPath,
  };

  writeFileSync(join(outDir, "verification-report.json"), JSON.stringify(report, null, 2), "utf8");

  console.log(JSON.stringify(report, null, 2));
  if (!allOk) {
    console.error("VERIFICATION FAILED");
    process.exit(1);
  }
  console.log(`VERIFICATION PASSED — preview: ${previewPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
