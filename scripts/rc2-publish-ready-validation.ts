/**
 * RC2 — Publish-ready validation (full professional generation).
 * Usage: npx tsx scripts/rc2-publish-ready-validation.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { generateWebsite } from "@/lib/website-generator";
import { evaluateGenerationPublishGates } from "@/lib/website/publish-quality";
import type { WebsiteGeneration } from "@/types/database";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "scripts/benchmark-results/rc2");
mkdirSync(outDir, { recursive: true });

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
process.env.WB_PRODUCTION_PIPELINE = "1";
process.env.WB_MASTER_PLAN = "1";

async function main() {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    console.error("FAIL: DEEPSEEK_API_KEY not set");
    process.exit(1);
  }

  const started = performance.now();
  const result = await generateWebsite({
    prompt:
      "Fine dining restaurant in Dubai with reservations, menu highlights, chef story, private dining events, and contact form. Premium luxury aesthetic with full SEO.",
    projectType: "business",
    projectKind: "website",
    language: "English",
    theme: "modern",
    industryId: "restaurant",
    websiteStructureTemplateId: "restaurant-signature",
    templateId: "restaurant",
    features: ["contact-form", "seo", "reservations"],
    generationProfile: "professional",
    preferredProvider: "deepseek",
    autoFallback: false,
    userId: "rc2-publish-ready",
    onProgress: (msg) => {
      if (process.env.RC2_VERBOSE === "1") console.error(msg);
    },
  });

  const wallMs = Math.round(performance.now() - started);
  const generation = {
    id: "rc2-publish-ready",
    project_name: "RC2 Publish Ready Restaurant",
    blueprint: result,
  } as unknown as WebsiteGeneration;
  const gates = evaluateGenerationPublishGates(generation);

  const report = {
    generatedAt: new Date().toISOString(),
    release: "RC2",
    generationProfile: "professional",
    wallMs,
    generationTimeMs: result.generationTimeMs,
    fileCount: result.files?.length ?? 0,
    tokens: result.usage,
    provider: result.provider,
    publishReady: gates.publishReady,
    blockers: gates.blockers,
    warnings: gates.warnings,
    scores: gates.scores,
    passed: gates.publishReady,
  };

  writeFileSync(join(outDir, "rc2-publish-ready.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  process.exit(gates.publishReady ? 0 : 1);
}

void main();
