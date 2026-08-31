/**
 * Phase 6D diagnostic: reproduce Veo createJob without mutating production adapters.
 * Never prints API keys, Authorization headers, or secret-looking strings.
 */
import { loadEnvLocal } from "./lib/dev-base-url.mjs";
import { veoVideoProvider, veoConfigured } from "../lib/ai-core/video-production-platform/providers/veo.ts";
import { getProviderV2 } from "../lib/ai-core/video-production-platform/provider-router/index.ts";

loadEnvLocal();

const SECRET_RE = /(AIza[0-9A-Za-z_-]{10,}|sk-[A-Za-z0-9_-]{10,}|Bearer\s+\S+|x-goog-api-key["']?\s*[:=]\s*["']?[^"'\s]+)/gi;

function redact(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(SECRET_RE, "[REDACTED]").slice(0, 2000);
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (/key|secret|authorization|token|password/i.test(key)) {
        out[key] = "[REDACTED]";
        continue;
      }
      out[key] = redact(nested);
    }
    return out;
  }
  return value;
}

function summarizeJson(text: string): {
  keys: string[];
  error?: unknown;
  status?: unknown;
  code?: unknown;
  message?: unknown;
  namePrefix?: string | null;
  nameLooksLikeOperation?: boolean;
  rawPreview: string;
} {
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    const name = typeof json.name === "string" ? json.name : null;
    const err = (json.error as Record<string, unknown> | undefined) || undefined;
    return {
      keys: Object.keys(json),
      error: redact(err || json.error),
      status: err?.status,
      code: err?.code,
      message: typeof err?.message === "string" ? String(redact(err.message)) : undefined,
      namePrefix: name ? name.split("/").slice(0, 2).join("/") : null,
      nameLooksLikeOperation: Boolean(name && (name.startsWith("operations/") || name.includes("/operations/"))),
      rawPreview: String(redact(JSON.stringify(json))).slice(0, 800),
    };
  } catch {
    return {
      keys: [],
      rawPreview: String(redact(text)).slice(0, 400),
    };
  }
}

async function main() {
  const geminiSet = Boolean(process.env.GEMINI_API_KEY?.trim());
  const veoSet = Boolean(process.env.VEO_API_KEY?.trim());
  const model = process.env.VEO_MODEL || "veo-3.1-generate-preview";
  const base =
    process.env.VEO_API_BASE_URL?.replace(/\/$/, "") ||
    "https://generativelanguage.googleapis.com/v1beta";
  const key = (process.env.VEO_API_KEY || process.env.GEMINI_API_KEY || "").trim();

  console.log("=== Veo config (no secrets) ===");
  console.log(JSON.stringify({
    GEMINI_API_KEY: geminiSet ? "SET" : "MISSING",
    VEO_API_KEY: veoSet ? "SET" : "MISSING",
    veoConfigured: veoConfigured(),
    model,
    endpointBase: base,
    predictLongRunning: `${base}/models/${model}:predictLongRunning`,
    generateVideos: `${base}/models/${model}:generateVideos`,
    healthGet: `${base}/models/${model}`,
  }, null, 2));

  if (!key) {
    console.log("STOP: no Veo/Gemini key configured.");
    process.exit(2);
  }

  const headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": key,
  };

  const health = await fetch(`${base}/models/${model}`, { headers });
  const healthText = await health.text();
  console.log("\n=== Health GET models/{model} ===");
  console.log(JSON.stringify({
    httpStatus: health.status,
    ok: health.ok,
    contentType: health.headers.get("content-type"),
    body: summarizeJson(healthText),
  }, null, 2));

  const body = {
    instances: [{ prompt: "A calm ocean at sunrise, slow aerial shot, cinematic lighting, no text overlays." }],
    parameters: {
      aspectRatio: "16:9",
      resolution: process.env.VEO_RESOLUTION || "720p",
      durationSeconds: 4,
      sampleCount: 1,
    },
  };

  const post = await fetch(`${base}/models/${model}:predictLongRunning`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const postText = await post.text();
  const postSummary = summarizeJson(postText);
  console.log("\n=== RAW predictLongRunning ===");
  console.log(JSON.stringify({
    httpStatus: post.status,
    ok: post.ok,
    contentType: post.headers.get("content-type"),
    requestShape: {
      instances: ["prompt"],
      parameters: Object.keys(body.parameters),
    },
    body: postSummary,
  }, null, 2));

  if (!post.ok && post.status === 404) {
    const alt = await fetch(`${base}/models/${model}:generateVideos`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt: "A calm ocean at sunrise, slow aerial shot, cinematic lighting, no text overlays.",
        config: { aspectRatio: "16:9", numberOfVideos: 1 },
      }),
    });
    const altText = await alt.text();
    console.log("\n=== generateVideos comparison (404 on predictLongRunning only) ===");
    console.log(JSON.stringify({
      httpStatus: alt.status,
      ok: alt.ok,
      body: summarizeJson(altText),
    }, null, 2));
  }

  console.log("\n=== Adapter generateClip (unchanged production code) ===");
  const clip = await veoVideoProvider.generateClip({
    prompt: "A calm ocean at sunrise, slow aerial shot, cinematic lighting, no text overlays.",
    durationSec: 4,
    aspectRatio: "16:9",
  });
  console.log(JSON.stringify(redact({
    status: clip.status,
    message: clip.message,
    error: clip.error,
    externalJobIdPrefix: clip.externalJobId
      ? String(clip.externalJobId).split("/").slice(0, 2).join("/")
      : null,
    hasBytes: Boolean(clip.bytes?.byteLength),
  }), null, 2));

  console.log("\n=== V2 createJob mapping ===");
  try {
    const provider = getProviderV2("veo");
    const handle = await provider.createJob({
      projectId: "diag-project",
      sceneId: "diag-scene",
      prompt: "A calm ocean at sunrise, slow aerial shot, cinematic lighting, no text overlays.",
      promptHash: "diagphase6dhashhashhash",
      durationSec: 4,
      aspectRatio: "16:9",
      idempotencyKey: `diag:${Date.now()}`,
    });
    console.log(JSON.stringify(redact({
      status: handle.status,
      message: handle.message,
      errorCode: handle.errorCode,
      externalJobIdPrefix: handle.externalJobId
        ? String(handle.externalJobId).split("/").slice(0, 2).join("/")
        : null,
    }), null, 2));
  } catch (error) {
    console.log(JSON.stringify(redact({
      thrown: true,
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
    }), null, 2));
  }

  const likely = [];
  if (post.status === 401 || post.status === 403) likely.push("auth/permissions");
  if (post.status === 404) likely.push("wrong endpoint or model");
  if (post.status === 400) likely.push("invalid request shape / unsupported parameter");
  if (post.status === 429) likely.push("quota");
  if (/RESOURCE_EXHAUSTED|quota|billing/i.test(postText)) likely.push("billing/quota");
  if (/PERMISSION_DENIED/i.test(postText)) likely.push("permissions");
  if (post.ok && !postSummary.nameLooksLikeOperation) likely.push("response parsing (operation name format)");
  if (post.ok && postSummary.nameLooksLikeOperation && !String(JSON.parse(postText).name || "").startsWith("operations/")) {
    likely.push("adapter extractOperationName too strict (requires operations/ prefix)");
  }
  console.log("\n=== Hypotheses ===");
  console.log(JSON.stringify(likely, null, 2));
}

main().catch((error) => {
  console.error("diagnostic crashed:", error instanceof Error ? error.message : "unknown");
  process.exit(1);
});
