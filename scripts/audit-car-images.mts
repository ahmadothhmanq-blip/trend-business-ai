import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateWebsite } from "@/lib/website-generator";
import { isHeroDominantIndustry, isAutomotiveVehiclePhotoUrl, countAutomotiveVehiclePhotos } from "@/lib/ai-core/image-engine/industry-slot-policy";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts", "benchmark-results", "car-image-audit");

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

const AUTOMOTIVE_HERO_IDS = [
  "photo-1492144534655-ae79c964c9d7",
  "photo-1503376780353-7e6692767b70",
  "photo-1542362567-b07e54358753",
  "photo-1485291571150-772bcfc10da5",
  "photo-1544636331-e26879cd4d9b",
  "photo-1486262715619-67b85e0b08d3",
  "photo-1502877338538-ec513f5b8c4c",
  "photo-1511919884226-fd3cad54694b",
  "photo-1493238792120-0d746b213b5e",
];

function extractUrlsFromSiteImages(source: string): string[] {
  const urls: string[] = [];
  const re =
    /https:\/\/images\.unsplash\.com\/[^\s"'`]+/g;
  for (const match of source.matchAll(re)) {
    urls.push(match[0]!);
  }
  return [...new Set(urls)];
}

function isAutomotiveCarUrl(url: string): boolean {
  return AUTOMOTIVE_HERO_IDS.some((id) => url.includes(id));
}

loadEnvLocal();
mkdirSync(outDir, { recursive: true });

if (!process.env.DEEPSEEK_API_KEY?.trim()) {
  console.error("DEEPSEEK_API_KEY required");
  process.exit(1);
}

console.log("Generating automotive website for image audit…\n");

const result = await generateWebsite({
  prompt: "Create a website for a car company called Apex Motors",
  projectType: "business",
  projectKind: "website",
  language: "English",
  theme: "modern",
  features: ["contact-form", "seo"],
  generationProfile: "ultra",
  imageStrategyMode: "with-images",
  userId: "car-image-audit",
  onProgress: (msg) => console.error(`[progress] ${msg}`),
});

const siteImages = result.files.find((f) => f.path.replaceAll("\\", "/") === "lib/site-images.ts");
writeFileSync(join(outDir, "site-images.ts"), siteImages?.content ?? "", "utf8");

const urls = extractUrlsFromSiteImages(siteImages?.content ?? "");
const carUrls = urls.filter(isAutomotiveVehiclePhotoUrl);
const routingId =
  result.settings?.businessIndustry ??
  result.businessProfile?.routingIndustryId ??
  "unknown";

const manifestItems = result.assetManifest?.items ?? [];
const manifestUrls = [
  ...new Set(manifestItems.map((i) => i.url).filter(Boolean) as string[]),
];

const report = {
  title: result.title,
  routingIndustryId: routingId,
  heroDominantPolicy: isHeroDominantIndustry(routingId),
  settingsBusinessIndustry: result.settings?.businessIndustry ?? null,
  totalUniqueUrlsInSiteImages: urls.length,
  automotiveCarPhotoCount: carUrls.length,
  nonCarPhotoCount: urls.length - carUrls.length,
  manifestItemCount: manifestItems.length,
  manifestUniqueUrls: manifestUrls.length,
  carUrls,
  allUrls: urls,
  pass: countAutomotiveVehiclePhotos(urls) <= 2,
};

writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
