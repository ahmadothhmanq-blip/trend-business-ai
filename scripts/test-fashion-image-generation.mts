/**
 * Generate a fashion retail site and audit image URLs.
 * Usage: npx tsx scripts/test-fashion-image-generation.mts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateWebsite } from "@/lib/website-generator";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts", "benchmark-results", "fashion-image-audit");

const PHONE_PHOTO_IDS = [
  "photo-1511707171634-5f897ff02aa9",
  "photo-1592750475338-74b7b21085ab",
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

loadEnvLocal();

async function checkUrl(url: string): Promise<{ ok: boolean; status?: number }> {
  if (!url || url.startsWith("data:")) return { ok: true };
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false };
  }
}

function extractUrlsFromSiteImages(content: string): string[] {
  const urls = new Set<string>();
  const re = /https?:\/\/[^\s"'`\\)]+/g;
  for (const m of content.matchAll(re)) {
    const u = m[0]!.replace(/[),;]+$/, "");
    if (u.includes("unsplash") || u.includes("supabase")) urls.add(u);
  }
  return [...urls];
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    console.error("DEEPSEEK_API_KEY required");
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });

  console.log("Generating fashion retail website (professional, with-images)…\n");

  const result = await generateWebsite({
    prompt: "شركة ملابس نسائية وأزياء عصرية مع توصيل في جدة",
    projectType: "business",
    projectKind: "website",
    language: "Arabic",
    theme: "modern",
    features: ["contact-form", "seo"],
    generationProfile: "professional",
    imageStrategyMode: "with-images",
    visualSkinId: "sovereign",
    autoFallback: true,
    userId: "fashion-image-audit",
    onProgress: (msg) => console.error(`[progress] ${msg}`),
  });

  const siteImages = result.files.find((f) => f.path === "lib/site-images.ts");
  const urls = siteImages
    ? extractUrlsFromSiteImages(siteImages.content)
    : (result.assetManifest?.items ?? []).map((i) => i.url).filter(Boolean);

  const urlChecks = [];
  let wrongIndustry = 0;
  for (const url of urls) {
    const check = await checkUrl(url as string);
    const hasPhone = PHONE_PHOTO_IDS.some((id) => (url as string).includes(id));
    if (hasPhone) wrongIndustry += 1;
    urlChecks.push({ url, ...check, wrongIndustry: hasPhone });
    const mark = !check.ok ? "FAIL" : hasPhone ? "WRONG" : "OK";
    console.log(`${mark} ${check.status ?? "-"} ${(url as string).slice(0, 100)}`);
  }

  const report = {
    archetype: result.sitePlan?.archetypeId,
    routing: result.sitePlan?.industry,
    broken: urlChecks.filter((u) => !u.ok).length,
    wrongIndustry,
    photoCount: result.assetManifest?.items?.length ?? 0,
  };

  if (siteImages) {
    writeFileSync(join(outDir, "site-images.ts"), siteImages.content);
  }
  writeFileSync(join(outDir, "report.json"), JSON.stringify({ report, urlChecks }, null, 2));

  console.log("\n=== Summary ===");
  console.log(JSON.stringify(report, null, 2));

  process.exit(report.broken || report.wrongIndustry ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
