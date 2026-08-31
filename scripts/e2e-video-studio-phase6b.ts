/**
 * Phase 6B runtime proof:
 * Provider health → (optional) real Veo/Runway job → artifact validation
 */
import { createHash } from "node:crypto";
import { loadEnvLocal } from "./lib/dev-base-url.mjs";
import { createProviderRegistry, getProviderV2 } from "../lib/ai-core/video-production-platform/provider-router/index.ts";
import { veoConfigured } from "../lib/ai-core/video-production-platform/providers/veo.ts";

loadEnvLocal();

const PROJECT = "phase6b-project";
const SCENE = "phase6b-scene";

type Step = { name: string; status: "PASS" | "FAIL" | "SKIP"; detail?: string };
const steps: Step[] = [];

function log(step: Step) {
  steps.push(step);
  console.log(`${step.status.padEnd(5)} ${step.name}${step.detail ? ` — ${step.detail}` : ""}`);
}

function hasRunway(): boolean {
  return Boolean(process.env.RUNWAY_API_KEY?.trim());
}

function magicMp4(bytes: Uint8Array): boolean {
  return bytes.byteLength >= 12 && bytes.toString("ascii", 4, 8) === "ftyp";
}

async function exerciseProvider(id: "veo" | "runway") {
  const provider = getProviderV2(id);
  const health = await provider.health();
  log({
    name: `${id} health`,
    status: health.ok ? "PASS" : health.status === "unconfigured" ? "SKIP" : "FAIL",
    detail: health.reason,
  });
  if (!health.ok) return null;

  const estimate = provider.estimateCost({ durationSec: 4, quality: "standard" });
  log({ name: `${id} estimateCost`, status: "PASS", detail: `${estimate.credits} credits` });

  const idempotencyKey = `${PROJECT}:${SCENE}:${id}:${Date.now()}`;
  const handle = await provider.createJob({
    projectId: PROJECT,
    sceneId: SCENE,
    prompt: "A calm ocean at sunrise, slow aerial shot, cinematic lighting, no text overlays.",
    promptHash: createHash("sha256").update("phase6b").digest("hex").slice(0, 24),
    durationSec: 4,
    aspectRatio: "16:9",
    idempotencyKey,
  });

  if (handle.status === "failed") {
    log({ name: `${id} createJob`, status: "FAIL", detail: handle.message });
    return null;
  }
  log({
    name: `${id} createJob`,
    status: "PASS",
    detail: `${handle.status} external=${handle.externalJobId || "inline"}`,
  });

  let current = handle;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (current.status === "succeeded" || current.status === "failed" || current.status === "cancelled") {
      break;
    }
    if (!current.externalJobId) break;
    await new Promise((r) => setTimeout(r, 5000));
    current = await provider.pollJob(current.externalJobId, idempotencyKey);
    console.log(`      poll ${attempt + 1}: ${current.status} — ${current.message}`);
  }

  if (current.status !== "succeeded") {
    log({ name: `${id} pollJob`, status: "FAIL", detail: current.message });
    return null;
  }
  log({ name: `${id} pollJob`, status: "PASS", detail: current.status });

  const bytes = current.bytes;
  if (!bytes?.byteLength) {
    log({ name: `${id} artifact bytes`, status: "FAIL", detail: "no bytes returned" });
    return null;
  }

  const checksum = createHash("sha256").update(bytes).digest("hex");
  const mime = current.mimeType || "video/mp4";
  log({
    name: `${id} artifact validation`,
    status: magicMp4(bytes) && bytes.byteLength > 1024 ? "PASS" : "FAIL",
    detail: `mime=${mime} size=${bytes.byteLength} sha256=${checksum.slice(0, 16)}…`,
  });

  return { bytes, checksum, mime, provider: id };
}

async function main() {
  console.log("Video Studio Phase 6B — Real Provider Execution\n");

  const registry = createProviderRegistry();
  log({
    name: "registry",
    status: "PASS",
    detail: `providers=${Object.keys(registry).join(",")}`,
  });

  const veoReady = veoConfigured();
  const runwayReady = hasRunway();
  log({
    name: "credentials",
    status: veoReady || runwayReady ? "PASS" : "SKIP",
    detail: `veo=${veoReady ? "set" : "missing"} runway=${runwayReady ? "set" : "missing"}`,
  });

  let verified = 0;
  if (veoReady) {
    const artifact = await exerciseProvider("veo");
    if (artifact) verified += 1;
  } else {
    const veo = getProviderV2("veo", { veo: false, kling: false, runway: false, heygen: false, external: false });
    const health = await veo.health();
    log({ name: "veo unconfigured (honest)", status: health.ok ? "FAIL" : "PASS", detail: health.reason });
  }

  if (runwayReady) {
    const artifact = await exerciseProvider("runway");
    if (artifact) verified += 1;
  } else {
    const runway = getProviderV2("runway", { veo: false, kling: false, runway: false, heygen: false, external: false });
    const health = runway.health();
    log({ name: "runway unconfigured (honest)", status: health.ok ? "FAIL" : "PASS", detail: health.reason });
  }

  if (veoReady && runwayReady) {
    log({
      name: "provider comparison",
      status: verified >= 2 ? "PASS" : "FAIL",
      detail: "both adapters exercised through unified v2 contract",
    });
  }

  const failed = steps.filter((step) => step.status === "FAIL").length;
  const passed = steps.filter((step) => step.status === "PASS").length;
  console.log(`\nSummary: ${passed} passed, ${failed} failed, ${steps.length} steps`);
  if (failed > 0) process.exit(1);
  if (!veoReady && !runwayReady) {
    console.log("No provider credentials — unconfigured path verified.");
    process.exit(0);
  }
  if (verified < 1) {
    console.log("Credentials present but no successful real artifact.");
    process.exit(1);
  }
  console.log("Phase 6B runtime verification complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
