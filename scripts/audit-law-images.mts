import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateWebsite } from "@/lib/website-generator";
import { resolveImageRoutingFromContext } from "@/lib/website/site-plan/resolve-image-routing";
import { isAutomotiveVehiclePhotoUrl } from "@/lib/ai-core/image-engine/industry-slot-policy";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts", "benchmark-results", "law-image-audit");

const LAW_HERO_IDS = [
  "photo-1589829545856-d10d557cf57f",
  "photo-1450101499163-c8848c66ca85",
  "photo-1521791136064-7986c2920216",
  "photo-1454165804606-c3d57bc86b40",
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

function extractUrls(source: string): string[] {
  const urls: string[] = [];
  const re = /https:\/\/images\.unsplash\.com\/[^\s"'`]+/g;
  for (const match of source.matchAll(re)) urls.push(match[0]!);
  return [...new Set(urls)];
}

function isLawPhotoUrl(url: string): boolean {
  return LAW_HERO_IDS.some((id) => url.includes(id));
}

loadEnvLocal();
mkdirSync(outDir, { recursive: true });

const prompt =
  "موقع لمكتب محاماة متخصص في القضايا التجارية والاستشارات القانونية في الرياض";

const preRouting = resolveImageRoutingFromContext({ prompt });
console.log("Pre-generation routing:", JSON.stringify(preRouting, null, 2));

if (!process.env.DEEPSEEK_API_KEY?.trim()) {
  console.error("DEEPSEEK_API_KEY required");
  process.exit(1);
}

console.log("\nGenerating law firm website…\n");

const result = await generateWebsite({
  prompt,
  projectType: "business",
  projectKind: "website",
  language: "Arabic",
  theme: "modern",
  features: ["contact-form", "seo"],
  generationProfile: "ultra",
  imageStrategyMode: "with-images",
  userId: "law-image-audit",
  onProgress: (msg) => console.error(`[progress] ${msg}`),
});

const siteImages = result.files.find(
  (f) => f.path.replaceAll("\\", "/") === "lib/site-images.ts",
);
writeFileSync(join(outDir, "site-images.ts"), siteImages?.content ?? "", "utf8");

const home = result.files.find((f) => {
  const p = f.path.replaceAll("\\", "/");
  return p === "app/page.tsx" || p === "src/app/page.tsx";
});
writeFileSync(join(outDir, "page.tsx"), home?.content ?? "", "utf8");

const urls = extractUrls(siteImages?.content ?? "");
const lawUrls = urls.filter(isLawPhotoUrl);
const carUrls = urls.filter(isAutomotiveVehiclePhotoUrl);
const routingId =
  result.settings?.businessIndustry ??
  result.businessProfile?.routingIndustryId ??
  "unknown";

const homeText = home?.content ?? "";
const badPhrases = [
  "Hero Split",
  "Generating website",
  "AI-generated website product preview",
  "Apex Motors",
  "car company",
];

const report = {
  title: result.title,
  preRoutingIndustryId: preRouting.routingIndustryId,
  routingIndustryId: routingId,
  settingsBusinessIndustry: result.settings?.businessIndustry ?? null,
  totalUniqueUrls: urls.length,
  lawPhotoCount: lawUrls.length,
  carPhotoCount: carUrls.length,
  lawUrls,
  carUrls,
  badPhrasesFound: badPhrases.filter((p) =>
    homeText.toLowerCase().includes(p.toLowerCase()),
  ),
  pass:
    routingId === "law" &&
    carUrls.length === 0 &&
    lawUrls.length >= 1 &&
    badPhrases.filter((p) => homeText.toLowerCase().includes(p.toLowerCase()))
      .length === 0,
};

writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
