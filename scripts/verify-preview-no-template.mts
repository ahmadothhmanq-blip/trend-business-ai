import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateWebsite } from "@/lib/website-generator";
import {
  buildStaticPreviewHtml,
  ensureStaticPreviewFile,
} from "@/lib/website/build-static-preview.server";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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

const result = await generateWebsite({
  prompt: "شركة مفروشات صغيرة للاختبار",
  projectType: "business",
  projectKind: "website",
  language: "Arabic",
  theme: "modern",
  features: ["contact-form"],
  generationProfile: "ultra",
  imageStrategyMode: "with-images",
  userId: "preview-check",
});

const files = ensureStaticPreviewFile({ ...result, files: result.files });
const preview = files.find((f) => f.path.replaceAll("\\", "/").endsWith("preview.html"));
const html =
  preview?.content ??
  buildStaticPreviewHtml({
    title: result.title,
    files: result.files,
    language: "Arabic",
    settings: result.settings as Record<string, unknown>,
  });

const settings = result.settings as Record<string, unknown> | undefined;
const report = {
  visualSkinId: settings?.visualSkinId ?? null,
  templateIntelligenceId: settings?.templateIntelligenceId ?? null,
  templatePackageId: settings?.templatePackageId ?? null,
  previewMarkers: {
    projectFiles: html.includes('data-project-files-render="project-files-1"'),
    v2: html.includes("data-v2-render"),
    tiTemplate: html.includes("data-ti-template"),
    heroSplit:
      html.includes("HeroSplit") || html.includes("ti-hero--saas-split"),
    brandInHtml: html.includes(result.title?.slice(0, 8) ?? ""),
  },
};

console.log(JSON.stringify(report, null, 2));
process.exit(
  report.visualSkinId ||
    report.templateIntelligenceId ||
    report.previewMarkers.tiTemplate ||
    report.previewMarkers.heroSplit
    ? 1
    : 0,
);
