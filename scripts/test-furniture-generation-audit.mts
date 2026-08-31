/**
 * Generate a furniture company site and audit images + template/skin settings.
 * Usage: npx tsx scripts/test-furniture-generation-audit.mts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateWebsite } from "@/lib/website-generator";
import { resolveImageRoutingFromContext } from "@/lib/website/site-plan/resolve-image-routing";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts", "benchmark-results", "furniture-audit");

const WRONG_INDUSTRY_PHOTOS = [
  "photo-1511707171634-5f897ff02aa9",
  "photo-1515372039744-b8f02a3ae446",
  "photo-1414235077428-338989a2e8c0",
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
  if (!url?.startsWith("http")) return { ok: true };
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false };
  }
}

function extractUrls(content: string): string[] {
  const urls = new Set<string>();
  for (const m of content.matchAll(/https?:\/\/[^\s"'`\\)]+/g)) {
    urls.add(m[0]!.replace(/[),;]+$/, ""));
  }
  return [...urls];
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    console.error("DEEPSEEK_API_KEY required");
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });
  const prompt = "شركة مفروشات وبيع أثاث منزلي وغرف نوم في الرياض";

  const routing = resolveImageRoutingFromContext({ prompt });
  console.log("Pre-routing:", routing);

  console.log("\nGenerating furniture website…\n");

  const result = await generateWebsite({
    prompt,
    projectType: "business",
    projectKind: "website",
    language: "Arabic",
    theme: "modern",
    features: ["contact-form", "seo"],
    generationProfile: "professional",
    imageStrategyMode: "with-images",
    autoFallback: true,
    userId: "furniture-audit",
    onProgress: (msg) => console.error(`[progress] ${msg}`),
  });

  const siteImages = result.files.find((f) => f.path === "lib/site-images.ts");
  const urls = siteImages ? extractUrls(siteImages.content) : [];

  const urlChecks = [];
  let broken = 0;
  let wrongIndustry = 0;
  for (const url of urls) {
    const check = await checkUrl(url);
    const wrong = WRONG_INDUSTRY_PHOTOS.some((id) => url.includes(id));
    if (!check.ok) broken += 1;
    if (wrong) wrongIndustry += 1;
    urlChecks.push({ url, ...check, wrongIndustry: wrong });
    console.log(
      `${!check.ok ? "FAIL" : wrong ? "WRONG" : "OK"} ${check.status ?? "-"} ${url.slice(0, 95)}`,
    );
  }

  const report = {
    prompt,
    preRouting: routing,
    archetype: result.sitePlan?.archetypeId,
    visualSkinId: result.settings?.visualSkinId,
    templateIntelligenceId: result.settings?.templateIntelligenceId,
    premiumTemplateId: result.settings?.premiumTemplateId,
    routingIndustryId: result.settings?.businessIndustry,
    photoCount: result.assetManifest?.items?.length ?? 0,
    broken,
    wrongIndustry,
    uniqueUrls: urls.length,
  };

  if (siteImages) writeFileSync(join(outDir, "site-images.ts"), siteImages.content);
  writeFileSync(join(outDir, "report.json"), JSON.stringify({ report, urlChecks }, null, 2));

  console.log("\n=== Summary ===");
  console.log(JSON.stringify(report, null, 2));

  process.exit(broken || wrongIndustry ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
