/**
 * Generate one AI flagship website for QA.
 * Usage: npx tsx scripts/generate-flagship-website.mts <package-id> <slug> <language> "<prompt>"
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { generateWebsite } from "../lib/website-generator.ts";
import { buildStaticPreviewHtml, ensureStaticPreviewFile } from "../lib/website/build-static-preview.server.ts";
import {
  projectContainsThemeComponents,
  projectUsesV2FlagshipComponents,
} from "../lib/website/template-v2/generation/v2-generation-bridge.ts";
import { clearV2PreviewCompilerCache } from "../lib/website/template-v2/preview/v2-preview-compiler.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(root, "scripts", "benchmark-results", "generated-flagship-websites");

const [packageId, slug, language, ...promptParts] = process.argv.slice(2);
const prompt = promptParts.join(" ").trim();
if (!packageId || !slug || !language || !prompt) {
  console.error(
    'Usage: npx tsx scripts/generate-flagship-website.mts <package-id> <slug> <language> "<prompt>"',
  );
  process.exit(1);
}

mkdirSync(outRoot, { recursive: true });
const siteDir = join(outRoot, slug);
mkdirSync(siteDir, { recursive: true });

const t0 = performance.now();
const result = await generateWebsite({
  prompt,
  language,
  websiteStructureTemplateId: packageId,
  templateId: packageId,
  marketplaceTemplateId: packageId,
  projectKind: "website",
  generationProfile: "professional",
  userId: `flagship-${slug}`,
  onProgress: (msg) => console.error(msg),
});

const project = result.project;
const files = project.files ?? [];
const hasTheme = projectContainsThemeComponents(files);
const hasV2 = projectUsesV2FlagshipComponents(files, packageId);
const componentCount = files.filter((f) => f.path.includes(`${packageId}-`)).length;

clearV2PreviewCompilerCache();
const settings = (project.settings ?? {}) as Record<string, unknown>;
const html = buildStaticPreviewHtml({
  title: project.title,
  description: project.description,
  pages: project.pages,
  sections: project.sections,
  colorPalette: project.colorPalette,
  typography: project.typography,
  content: project.content,
  components: project.components,
  files,
  templateArchitectureVersion: settings.templateArchitectureVersion as "v1" | "v2" | undefined,
  templatePackageId: (settings.templatePackageId as string | undefined) ?? packageId,
  settings,
  language,
});

writeFileSync(join(siteDir, "preview.html"), html, "utf8");
writeFileSync(
  join(siteDir, "project.json"),
  JSON.stringify(
    {
      slug,
      packageId,
      language,
      prompt,
      elapsedMs: Math.round(performance.now() - t0),
      hasTheme,
      hasV2,
      componentCount,
      fileCount: files.length,
    },
    null,
    2,
  ),
  "utf8",
);

for (const file of files) {
  const target = join(siteDir, "files", file.path);
  ensureStaticPreviewFile(target, file.content);
}

console.log(
  JSON.stringify(
    { slug, packageId, hasTheme, hasV2, componentCount, passed: hasV2 && !hasTheme },
    null,
    2,
  ),
);
process.exit(hasV2 && !hasTheme ? 0 : 1);
