/**
 * Generate a mobile retail site and audit image URLs + site-images module.
 * Usage: npx tsx scripts/test-mobile-image-generation.mts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateWebsite } from "@/lib/website-generator";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts", "benchmark-results", "mobile-image-audit");

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

async function checkUrl(url: string): Promise<{ ok: boolean; status?: number; type?: string }> {
  if (!url || url.startsWith("data:")) return { ok: true, type: "inline" };
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return {
      ok: res.ok,
      status: res.status,
      type: res.headers.get("content-type") ?? undefined,
    };
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

  console.log("Generating mobile retail website (professional, with-images)…\n");

  const result = await generateWebsite({
    prompt: "شركة موبايل لبيع الجوالات والإكسسوارات مع صيانة وتقسيط في الرياض",
    projectType: "business",
    projectKind: "website",
    language: "Arabic",
    theme: "modern",
    industryId: "electronics-retail",
    features: ["contact-form", "seo"],
    generationProfile: "professional",
    imageStrategyMode: "with-images",
    visualSkinId: "sovereign",
    autoFallback: true,
    userId: "mobile-image-audit",
    onProgress: (msg) => console.error(`[progress] ${msg}`),
  });

  const siteImages = result.files.find((f) => f.path === "lib/site-images.ts");
  const manifest = result.assetManifest;

  const report: Record<string, unknown> = {
    title: result.title,
    sitePlanArchetype: result.sitePlan?.archetypeId ?? result.settings?.sitePlanArchetype,
    assetEngine: manifest?.engine,
    assetProviders: manifest?.items?.map((i) => ({
      id: i.id,
      role: i.role,
      provider: i.metadata?.provider,
      status: i.status,
      url: i.url?.slice(0, 120),
    })),
    imageStrategy: result.sitePlan?.imageStrategy,
  };

  const urls = siteImages
    ? extractUrlsFromSiteImages(siteImages.content)
    : (manifest?.items ?? []).map((i) => i.url).filter(Boolean);

  const urlChecks = [];
  for (const url of urls) {
    const check = await checkUrl(url as string);
    urlChecks.push({ url, ...check });
    const mark = check.ok ? "OK" : "FAIL";
    console.log(`${mark} ${check.status ?? "-"} ${(url as string).slice(0, 100)}`);
  }

  report.urlChecks = urlChecks;
  report.brokenUrls = urlChecks.filter((u) => !u.ok);
  report.stockOnly = manifest?.items?.every(
    (i) => i.metadata?.provider === "premium-stock" || !i.metadata?.provider,
  );

  if (siteImages) {
    writeFileSync(join(outDir, "site-images.ts"), siteImages.content);
  }
  writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2));

  console.log("\n=== Summary ===");
  console.log(JSON.stringify({
    archetype: report.sitePlanArchetype,
    photoCount: manifest?.items?.length ?? 0,
    stockOnly: report.stockOnly,
    broken: (report.brokenUrls as unknown[]).length,
    outDir,
  }, null, 2));

  process.exit((report.brokenUrls as unknown[]).length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
