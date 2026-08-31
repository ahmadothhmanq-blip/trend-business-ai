import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateWebsite } from "@/lib/website-generator";
import {
  buildStaticPreviewHtml,
  ensureStaticPreviewFile,
} from "@/lib/website/build-static-preview.server";
import { resolveLivePreviewHtml } from "@/lib/website/live-preview.server";
import { previewInputFromGeneration } from "@/lib/website/live-preview";
import { isGeneratingWebsitePlaceholderTitle } from "@/lib/ai-core/content/content-language";
import type { WebsiteGeneration } from "@/types/database";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts", "benchmark-results", "car-preview-audit");

const BAD_PHRASES = [
  "Generating website",
  "جاري إنشاء الموقع",
  "Hero Split",
  "Features Modern",
  "AI-generated website product preview",
  "Create a website for",
];

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

function findBadPhrases(text: string): string[] {
  return BAD_PHRASES.filter((phrase) => text.includes(phrase));
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

loadEnvLocal();

if (!process.env.DEEPSEEK_API_KEY?.trim()) {
  console.error("DEEPSEEK_API_KEY required");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const prompt = "Create a website for a car company called Apex Motors";

console.log("Generating car company website…\n");

const result = await generateWebsite({
  prompt,
  projectType: "business",
  projectKind: "website",
  language: "English",
  theme: "modern",
  features: ["contact-form", "seo"],
  generationProfile: "ultra",
  imageStrategyMode: "with-images",
  userId: "car-preview-audit",
  onProgress: (msg) => console.error(`[progress] ${msg}`),
});

const page = result.files.find((f) => f.path.replaceAll("\\", "/") === "app/page.tsx");
writeFileSync(join(outDir, "app-page.tsx"), page?.content ?? "", "utf8");

const files = ensureStaticPreviewFile({ ...result, files: result.files });
const previewFile = files.find((f) =>
  f.path.replaceAll("\\", "/").endsWith("preview.html"),
);

const savedGeneration = {
  id: "00000000-0000-4000-8000-000000000001",
  project_name: result.title,
  business_description: result.description,
  language: "English",
  blueprint: { ...result, files },
} as unknown as WebsiteGeneration;

const liveHtml = resolveLivePreviewHtml(savedGeneration);
const directHtml =
  previewFile?.content ??
  buildStaticPreviewHtml({
    title: result.title,
    description: result.description,
    files: result.files,
    language: "English",
    settings: result.settings as Record<string, unknown>,
    pages: result.pages,
    sections: result.sections,
    content: result.content,
    components: result.components,
  });

const previewInput = previewInputFromGeneration(savedGeneration);

writeFileSync(join(outDir, "preview.html"), liveHtml, "utf8");

const report = {
  title: result.title,
  titleIsPlaceholder: isGeneratingWebsitePlaceholderTitle(result.title),
  previewInputTitle: previewInput.title,
  previewInputTitleIsPlaceholder: isGeneratingWebsitePlaceholderTitle(
    previewInput.title,
  ),
  previewMarkers: {
    projectFiles: liveHtml.includes('data-project-files-render="project-files-1"'),
    v2: liveHtml.includes("data-v2-render"),
    tiLegacy: liveHtml.includes('data-ti-render="v2"'),
    tiV5: liveHtml.includes('data-ti-render="v5"'),
  },
  badInLiveHtml: findBadPhrases(stripHtml(liveHtml)),
  badInPageSource: findBadPhrases(page?.content ?? ""),
  textSample: stripHtml(liveHtml).slice(0, 500),
};

writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify(report, null, 2));

const failed =
  report.badInLiveHtml.length > 0 ||
  report.titleIsPlaceholder ||
  report.previewInputTitleIsPlaceholder;

process.exit(failed ? 1 : 0);
