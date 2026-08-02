/**
 * Verify TBGE is active and run one live website generation.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveWebsiteTbgeRoute } from "@/lib/tbge/integration/router";
import { shouldBypassLegacyWebsitePipeline } from "@/lib/tbge/flags";
import { generateWebsite } from "@/lib/website-generator";

function loadEnvLocal() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
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
    process.env[key] = value;
  }
}

loadEnvLocal();

async function main() {
  const route = resolveWebsiteTbgeRoute();
  console.log("TBGE route:", route.mode);
  console.log("Legacy bypass:", shouldBypassLegacyWebsitePipeline());

  if (route.mode !== "tbge-primary") {
    console.error("FAIL: TBGE is not active — route is", route.mode);
    process.exit(1);
  }

  const progressEvents: string[] = [];
  const started = Date.now();

  const result = await generateWebsite({
    prompt:
      "Boutique coffee roastery with online ordering, subscription plans, brewing guides, and wholesale inquiries. Warm artisan aesthetic.",
    language: "English",
    theme: "Warm Artisan",
    projectType: "Restaurant",
    projectKind: "website",
    features: ["contact-form", "seo"],
    generationProfile: "professional",
    userId: "tbge-live-verify",
    onProgress: (msg) => {
      progressEvents.push(msg);
      console.error(msg);
    },
  });

  const wallMs = Date.now() - started;
  const legacyMarkers = progressEvents.filter(
    (e) =>
      e.includes("[pre]") ||
      e.includes("[strategy]") ||
      e.includes("file-generation") ||
      e.includes("layerRunner") ||
      e.includes("[maoe]"),
  );
  const tbgeMarkers = progressEvents.filter((e) => e.includes("[tbge]"));

  const report = {
    route: route.mode,
    legacyBypassed: legacyMarkers.length === 0 && tbgeMarkers.length > 0,
    generationTimeMs: result.generationTimeMs,
    wallClockMs: wallMs,
    llmCalls:
      (result as { tbgeIntegration?: { llmCalls?: number } }).tbgeIntegration?.llmCalls ??
      (result as { tbgeTrace?: { llmCalls?: number } }).tbgeTrace?.llmCalls ??
      null,
    fileCount: result.files?.length ?? 0,
    provider: result.provider,
    tokens: result.usage,
    legacyMarkersFound: legacyMarkers.length,
    tbgeMarkersFound: tbgeMarkers.length,
    tbgeIntegration: (result as { tbgeIntegration?: unknown }).tbgeIntegration,
  };

  console.log("\n=== TBGE LIVE GENERATION REPORT ===");
  console.log(JSON.stringify(report, null, 2));

  if (!report.legacyBypassed) {
    console.error("FAIL: Legacy pipeline markers detected");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
