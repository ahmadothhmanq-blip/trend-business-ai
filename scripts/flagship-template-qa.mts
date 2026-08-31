/**
 * Full flagship QA for a single V2 template package.
 * Usage: npx tsx scripts/flagship-template-qa.mts <package-id> [--ai] [--skip-lighthouse]
 */
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyStructureTemplateToProject } from "../lib/website/builder/apply-structure-template.ts";
import { buildStaticPreviewHtml } from "../lib/website/build-static-preview.server.ts";
import { runVisualDesignQuality } from "../lib/ai-core/visual-design-quality/analyze.ts";
import { clearV2PreviewCompilerCache } from "../lib/website/template-v2/preview/v2-preview-compiler.ts";
import { validateAndRepairProjectImages } from "../lib/website/image-management/validate-before-render.ts";
import type { GeneratedWebsiteProject } from "../plugins/website/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const previewRoot = join(root, "scripts", "benchmark-results", "flagship-previews");
const reportRoot = join(root, "scripts", "benchmark-results", "flagship-qa");

type TemplateSpec = {
  id: string;
  title: string;
  description: string;
  premiumClassRe: RegExp;
};

const TEMPLATE_SPECS: Record<string, TemplateSpec> = {
  "medical-premium": {
    id: "medical-premium",
    title: "Serenity Clinical",
    description: "Private healthcare network with world-class physicians",
    premiumClassRe: /mp-trust-badge|mp-headline|mp-btn-primary/,
  },
  "real-estate-premium": {
    id: "real-estate-premium",
    title: "Prestige Estates",
    description: "Editorial luxury real estate collection and private advisory",
    premiumClassRe: /rep-brass-rule|rep-headline|rep-section/,
  },
  "creative-agency-premium": {
    id: "creative-agency-premium",
    title: "Studio Volt",
    description: "Portfolio-forward creative agency with electric lime energy",
    premiumClassRe: /sv-display|sv-headline|sv-eyebrow/,
  },
  "education-premium": {
    id: "education-premium",
    title: "Heritage Academy",
    description: "Premier education institution",
    premiumClassRe: /ed-accent-line|ed-headline|ed-eyebrow/,
  },
  "finance-premium": {
    id: "finance-premium",
    title: "Meridian Capital",
    description: "Private wealth and institutional finance",
    premiumClassRe: /fn-accent-line|fn-headline|fn-eyebrow/,
  },
  "hotel-resort-premium": {
    id: "hotel-resort-premium",
    title: "Azure Haven",
    description: "Luxury hotel and resort escape",
    premiumClassRe: /hr-eyebrow|hr-headline|hr-grain/,
  },
  "ecommerce-premium": {
    id: "ecommerce-premium",
    title: "Atelier",
    description: "Curated commerce",
    premiumClassRe: /ec-editorial-frame|ec-headline/,
  },
  "saas-enterprise": {
    id: "saas-enterprise",
    title: "Nexus Command",
    description: "Enterprise SaaS platform",
    premiumClassRe: /se-eyebrow|se-headline|se-metric/,
  },
  "ai-startup-signal": {
    id: "ai-startup-signal",
    title: "Aura",
    description: "Signal-dark AI platform",
    premiumClassRe: /as-eyebrow|as-headline|as-hero-dashboard/,
  },
  "corporate-business": {
    id: "corporate-business",
    title: "Meridian Advisory",
    description: "Executive corporate advisory",
    premiumClassRe: /cb-eyebrow|cb-headline|cb-card/,
  },
  "restaurant-premium": {
    id: "restaurant-premium",
    title: "Ember Table",
    description: "Fine dining experience",
    premiumClassRe: /rp-eyebrow|rp-headline|rp-grain/,
  },
};

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

function scoreSlotIndependence(files: { path: string; content: string }[]) {
  const componentFiles = files.filter(
    (f) => f.path.includes("components/") && f.path.endsWith(".tsx"),
  );
  const slotUsages = componentFiles.reduce(
    (n, f) => n + (f.content.match(/\bSlotImage\b/g) ?? []).length,
    0,
  );
  const hardcoded = componentFiles.some((f) =>
    /<img\b|images\.unsplash\.com|template-images|_PREMIUM_IMAGES|resolveSiteImage/.test(f.content),
  );
  return { slotUsages, imageIndependent: slotUsages > 0 && !hardcoded };
}

function scorePreviewHtml(html: string, spec: TemplateSpec) {
  const imageUrls = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]!);
  const photoUrls = imageUrls.filter((u) => u.includes("images.unsplash.com") || u.startsWith("http"));
  const uniquePhotos = new Set(photoUrls);
  const duplicateImages = photoUrls.length - uniquePhotos.size;
  const imageCount = (html.match(/images\.unsplash\.com/g) ?? []).length;
  const hasHeroSlot = /slot="hero"|data-slot-empty="hero"/.test(html);
  const hasHeroImage =
    /<img[^>]+fetchPriority="high"/.test(html) ||
    /<img[^>]+fetchpriority="high"/i.test(html) ||
    hasHeroSlot;
  const usesSlotImages = /data-slot-empty=|slot="(?:hero|gallery|about|features|team|products|testimonials|cta|backgrounds)"/.test(html);
  const hasPlaceholder =
    /placeholder|lorem ipsum|professional presence|your brand|maison verdant/i.test(html);
  const sectionCount = (html.match(/data-v2-component="/g) ?? []).length;
  const premiumSignals = [
    imageCount >= 6 || usesSlotImages,
    hasHeroImage,
    !hasPlaceholder,
    duplicateImages === 0,
    sectionCount >= 10,
    /motion-safe:animate/.test(html),
    /--color-primary/.test(html),
    spec.premiumClassRe.test(html),
  ].filter(Boolean).length;
  return { imageCount, hasHeroImage, hasPlaceholder, sectionCount, premiumSignals, duplicateImages, uniquePhotoCount: uniquePhotos.size, usesSlotImages };
}

async function runLighthouse(html: string) {
  const dir = mkdtempSync(join(tmpdir(), "flagship-lh-"));
  writeFileSync(join(dir, "index.html"), html, "utf8");
  return new Promise<Record<string, number> | null>((resolve) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });
    server.listen(0, "127.0.0.1", () => {
      const port = (server.address() as { port: number }).port;
      const outPath = join(dir, "report.json");
      spawnSync(
        "npx",
        [
          "lighthouse",
          `http://127.0.0.1:${port}/`,
          "--output=json",
          `--output-path=${outPath}`,
          "--chrome-flags=--headless --no-sandbox",
          "--only-categories=performance,accessibility,best-practices,seo",
          "--quiet",
        ],
        { stdio: "pipe", shell: true, timeout: 120_000 },
      );
      server.close();
      try {
        if (!existsSync(outPath)) {
          resolve(null);
          return;
        }
        const report = JSON.parse(readFileSync(outPath, "utf8"));
        resolve({
          performance: Math.round((report.categories?.performance?.score ?? 0) * 100),
          accessibility: Math.round((report.categories?.accessibility?.score ?? 0) * 100),
          seo: Math.round((report.categories?.seo?.score ?? 0) * 100),
          bestPractices: Math.round((report.categories?.["best-practices"]?.score ?? 0) * 100),
        });
      } catch {
        resolve(null);
      } finally {
        try {
          rmSync(dir, { recursive: true, force: true });
        } catch {
          /* ignore */
        }
      }
    });
  });
}

const packageId = process.argv[2];
const skipLh = process.argv.includes("--skip-lighthouse");
if (!packageId || !TEMPLATE_SPECS[packageId]) {
  console.error("Usage: npx tsx scripts/flagship-template-qa.mts <package-id>");
  console.error("Known:", Object.keys(TEMPLATE_SPECS).join(", "));
  process.exit(1);
}

const spec = TEMPLATE_SPECS[packageId]!;
mkdirSync(previewRoot, { recursive: true });
mkdirSync(reportRoot, { recursive: true });
clearV2PreviewCompilerCache();

const applied = await applyStructureTemplateToProject({
  project: { ...baseProject, title: spec.title, description: spec.description },
  templatePackageId: packageId,
  language: "English",
});

const imageValidation = validateAndRepairProjectImages(applied.project.files ?? [], {
  templatePackageId: packageId,
});
const projectFiles = imageValidation.files;

const settings = (applied.project.settings ?? {}) as Record<string, unknown>;
const html = buildStaticPreviewHtml({
  title: spec.title,
  description: spec.description,
  pages: applied.project.pages,
  sections: applied.project.sections,
  colorPalette: applied.project.colorPalette,
  typography: applied.project.typography,
  content: applied.project.content,
  components: applied.project.components,
  files: projectFiles,
  templateArchitectureVersion: settings.templateArchitectureVersion as "v1" | "v2" | undefined,
  templatePackageId: (settings.templatePackageId as string | undefined) ?? packageId,
  settings,
  language: "English",
});

const outDir = join(previewRoot, packageId);
mkdirSync(outDir, { recursive: true });
const previewPath = join(outDir, "preview.html");
writeFileSync(previewPath, html, "utf8");

const visual = runVisualDesignQuality({
  files: applied.project.files.map((f) => ({ path: f.path, content: f.content })),
  brandName: spec.title,
  pages: ["home"],
});

const preview = scorePreviewHtml(html, spec);
const slotIndependence = scoreSlotIndependence(
  projectFiles.map((f) => ({ path: f.path, content: f.content })),
);
const premiumBonus =
  (preview.premiumSignals >= 7 ? 3 : preview.premiumSignals >= 6 ? 2 : 0) +
  (preview.imageCount >= 12 ? 3 : preview.imageCount >= 8 ? 2 : preview.imageCount >= 5 ? 1 : 0) +
  (preview.sectionCount >= 12 ? 1 : 0) +
  (slotIndependence.imageIndependent ? 4 : 0);
const marketplaceScore = Math.min(100, visual.scores.overall + premiumBonus);

let lighthouse = null;
if (!skipLh) {
  lighthouse = await runLighthouse(html);
}

const report = {
  packageId,
  completedAt: new Date().toISOString(),
  marketplaceScore,
  passed95: marketplaceScore >= 95,
  visual: visual.scores,
  preview,
  slotIndependence,
  imageValidation: {
    passed: imageValidation.passed,
    repairs: imageValidation.repairs,
    duplicatesRemoved: imageValidation.duplicatesRemoved,
    industryId: imageValidation.industryId,
    uniqueUrlCount: imageValidation.uniqueUrlCount,
    issues: imageValidation.issues.slice(0, 5),
    rulesReport: {
      passed: imageValidation.rulesReport.passed,
      score: imageValidation.rulesReport.score,
      industryDetected: imageValidation.rulesReport.detected.industryId,
      industryLabel: imageValidation.rulesReport.detected.industryLabel,
      subcategory: imageValidation.rulesReport.detected.subcategory,
      visualStyle: imageValidation.rulesReport.detected.visualStyle,
      profileId: imageValidation.rulesReport.profileId,
      selectedCount: imageValidation.rulesReport.selected.length,
      rejectedCount: imageValidation.rulesReport.rejected.length,
      replacedCount: imageValidation.rulesReport.replaced,
      sourceCounts: imageValidation.rulesReport.sourceCounts,
      summary: imageValidation.rulesReport.summary,
    },
  },
  lighthouse,
  previewPath,
  bytes: Buffer.byteLength(html),
  v2Markers: {
    package: html.includes(`data-v2-package="${packageId}"`),
    hero: html.includes(`data-v2-component="${packageId}`),
    render: html.includes('data-v2-render="v2-files"'),
  },
};

writeFileSync(join(reportRoot, `${packageId}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.passed95 ? 0 : 1);
