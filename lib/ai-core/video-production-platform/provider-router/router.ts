import { createHash } from "node:crypto";
import type {
  ModelRouterDecision,
  ModelRouterInput,
  ProviderV2Id,
  VideoProviderV2,
} from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { isProviderV2Id } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { ProviderRouterError } from "@/lib/ai-core/video-production-platform/provider-router/errors";
import { createProviderRegistry, type ProviderEnvSnapshot } from "@/lib/ai-core/video-production-platform/provider-router/registry";

export function hashRouterPrompt(input: ModelRouterInput): string {
  return createHash("sha256")
    .update(
      [
        input.projectId,
        input.sceneId,
        input.task,
        input.prompt,
        String(input.duration),
        input.quality,
        input.language || "",
        input.avatarRequired ? "avatar" : "",
        input.references?.images ? "img" : "",
        input.idempotencySalt || "",
      ].join("|"),
    )
    .digest("hex")
    .slice(0, 24);
}

function needsImage(input: ModelRouterInput): boolean {
  return input.task === "image-to-video" || Boolean(input.references?.images);
}

function needsAvatar(input: ModelRouterInput): boolean {
  return input.task === "avatar" || Boolean(input.avatarRequired);
}

function needsText(input: ModelRouterInput): boolean {
  return input.task === "text-to-video" || input.task === "scene" || (!needsAvatar(input) && !needsImage(input));
}

function capabilityMatch(provider: VideoProviderV2, input: ModelRouterInput): { ok: boolean; reason?: string } {
  const caps = provider.capabilities();
  if (input.duration > caps.maxDurationSec) {
    return { ok: false, reason: `duration ${input.duration}s exceeds ${provider.id} max ${caps.maxDurationSec}s` };
  }
  if (needsAvatar(input) && !caps.avatar) {
    return { ok: false, reason: `${provider.id} does not support avatar` };
  }
  if (needsImage(input) && !caps.imageToVideo) {
    return { ok: false, reason: `${provider.id} does not support image-to-video` };
  }
  if (needsText(input) && !caps.textToVideo && !needsAvatar(input)) {
    return { ok: false, reason: `${provider.id} does not support text-to-video` };
  }
  if (input.audioRequired && !caps.audio && needsAvatar(input)) {
    return { ok: false, reason: `${provider.id} does not support avatar audio` };
  }
  return { ok: true };
}

function scoreProvider(provider: VideoProviderV2, input: ModelRouterInput, cost: number): number {
  let score = 0;
  if (needsAvatar(input)) {
    if (provider.id === "heygen") score += 100;
    else if (provider.id === "external") score += 40;
  } else if (needsImage(input)) {
    if (provider.id === "kling") score += 90;
    else if (provider.id === "runway") score += 80;
    else if (provider.id === "veo") score += 78;
    else if (provider.id === "omni_flash") score += 76;
    else if (provider.id === "external") score += 50;
  } else {
    if (provider.id === "veo" && input.quality === "high") score += 95;
    else if (provider.id === "veo") score += 92;
    else if (provider.id === "omni_flash" && input.quality === "high") score += 92;
    else if (provider.id === "omni_flash") score += 88;
    else if (provider.id === "kling") score += 90;
    else if (provider.id === "runway") score += 75;
    else if (provider.id === "external") score += 55;
    else if (provider.id === "heygen") score += 20;
  }
  if (input.latencyTarget === "fast" && (provider.id === "kling" || provider.id === "runway")) score += 15;
  if (input.quality === "high" && provider.id === "kling") score += 10;
  if (input.budget != null) score += Math.max(0, 20 - cost);
  return score;
}

export function routeModel(
  input: ModelRouterInput,
  options: { snapshot?: ProviderEnvSnapshot; registry?: Record<ProviderV2Id, VideoProviderV2> } = {},
): ModelRouterDecision {
  if (input.preferredProvider === "preview") {
    throw new ProviderRouterError("Preview is not a production provider.", "preview_rejected");
  }

  const registry = options.registry || createProviderRegistry(options.snapshot);
  const excluded: Array<{ provider: string; reason: string }> = [];
  const capabilityMatchMap = {} as Record<ProviderV2Id, boolean>;
  const eligible: Array<{ provider: VideoProviderV2; cost: number; score: number }> = [];

  for (const provider of Object.values(registry)) {
    const health = provider.health();
    const match = capabilityMatch(provider, input);
    capabilityMatchMap[provider.id] = match.ok;

    if (provider.id === ("preview" as string)) {
      excluded.push({ provider: provider.id, reason: "preview is never eligible" });
      continue;
    }
    if (health.status === "unconfigured" || health.status === "degraded") {
      excluded.push({ provider: provider.id, reason: health.reason });
      continue;
    }
    if (health.status === "down" || !health.ok) {
      excluded.push({ provider: provider.id, reason: health.reason });
      continue;
    }
    if (!match.ok) {
      excluded.push({ provider: provider.id, reason: match.reason || "capability mismatch" });
      continue;
    }
    const estimate = provider.estimateCost({
      durationSec: input.duration,
      quality: input.quality,
      avatarRequired: needsAvatar(input),
    });
    if (input.budget != null && estimate.credits > input.budget) {
      excluded.push({
        provider: provider.id,
        reason: `estimated ${estimate.credits} credits exceeds budget ${input.budget}`,
      });
      continue;
    }
    eligible.push({
      provider,
      cost: estimate.credits,
      score: scoreProvider(provider, input, estimate.credits),
    });
  }

  eligible.sort((a, b) => b.score - a.score || a.cost - b.cost);

  if (input.preferredProvider && isProviderV2Id(input.preferredProvider)) {
    const preferred = eligible.find((row) => row.provider.id === input.preferredProvider);
    if (preferred) {
      const rest = eligible.filter((row) => row.provider.id !== preferred.provider.id);
      eligible.splice(0, eligible.length, preferred, ...rest);
    } else {
      excluded.push({
        provider: input.preferredProvider,
        reason: "preferred provider is not eligible",
      });
    }
  }

  if (!eligible.length) {
    const mismatchOnly = excluded.every(
      (row) =>
        row.reason.includes("does not support") ||
        row.reason.includes("exceeds") ||
        row.provider === "preview",
    );
    throw new ProviderRouterError(
      mismatchOnly
        ? "No provider supports the required capabilities."
        : "No configured healthy provider is eligible for this job.",
      excluded.some((row) => row.reason.includes("does not support"))
        ? "capability_mismatch"
        : "no_eligible_provider",
    );
  }

  const primary = eligible[0]!;
  const fallback = eligible[1]?.provider.id ?? null;
  const reasons = [
    `selected ${primary.provider.id} as primary`,
    fallback ? `fallback ${fallback}` : "no fallback available",
    `task=${input.task}`,
    `duration=${input.duration}`,
    `quality=${input.quality}`,
  ];

  return {
    primaryProvider: primary.provider.id,
    fallbackProvider: fallback,
    estimatedCost: primary.cost,
    capabilityMatch: capabilityMatchMap,
    metadata: {
      reasons,
      excluded,
      candidates: eligible.map((row) => row.provider.id),
      idempotencyPromptHash: hashRouterPrompt(input),
    },
  };
}
