import type {
  ProviderCapability,
  ProviderCostEstimate,
  ProviderHealth,
  ProviderJobHandle,
  ProviderJobRequest,
  ProviderV2Id,
  ProviderV2Status,
  RouterQuality,
  VideoProviderV2,
} from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { ProviderRouterError } from "@/lib/ai-core/video-production-platform/provider-router/errors";
import { envProviderFlags } from "@/lib/ai-core/video-production-platform/providers/types";
import { klingVideoProvider } from "@/lib/ai-core/video-production-platform/providers/kling";
import { runwayVideoProvider } from "@/lib/ai-core/video-production-platform/providers/runway";
import { heygenVideoProvider } from "@/lib/ai-core/video-production-platform/providers/heygen";
import { externalVideoProvider } from "@/lib/ai-core/video-production-platform/providers/external";
import { probeVeoHealth, veoConfigured, veoVideoProvider, getVeoGenerationAvailability, isVeoQuotaDegraded } from "@/lib/ai-core/video-production-platform/providers/veo";
import { omniFlashVideoProvider } from "@/lib/ai-core/video-production-platform/providers/google/omni-flash";
import type {
  VideoProvider,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";

export type ProviderEnvSnapshot = {
  veo?: boolean;
  omni_flash?: boolean;
  kling?: boolean;
  runway?: boolean;
  heygen?: boolean;
  external?: boolean;
  health?: Partial<Record<ProviderV2Id, ProviderV2Status>>;
};

const CAPABILITIES: Record<ProviderV2Id, ProviderCapability> = {
  veo: { textToVideo: true, imageToVideo: true, avatar: false, audio: false, maxDurationSec: 8 },
  omni_flash: { textToVideo: true, imageToVideo: true, avatar: false, audio: false, maxDurationSec: 10 },
  kling: { textToVideo: true, imageToVideo: true, avatar: false, audio: false, maxDurationSec: 15 },
  runway: { textToVideo: true, imageToVideo: true, avatar: false, audio: false, maxDurationSec: 10 },
  heygen: { textToVideo: false, imageToVideo: true, avatar: true, audio: true, maxDurationSec: 60 },
  external: { textToVideo: true, imageToVideo: true, avatar: true, audio: true, maxDurationSec: 30 },
};

const COST_WEIGHT: Record<ProviderV2Id, number> = {
  omni_flash: 1,
  kling: 1,
  runway: 1.2,
  heygen: 2,
  external: 1.1,
  veo: 1.4,
};

const VEO_COST_PER_SEC = Number(process.env.VEO_COST_PER_SEC || "0.75");

// Gemini Omni Flash pricing is token-based; Google publishes ~5,792 output video tokens/sec (720p)
// and $17.50 per 1M output tokens. That yields an effective ~$0.1014 per second (video).
// We convert to our internal "credits" by multiplying by 100 (same convention as Veo).
const OMNI_FLASH_COST_PER_SEC = Number(process.env.OMNI_FLASH_COST_PER_SEC || "0.1014");

export function readProviderEnv(snapshot?: ProviderEnvSnapshot): Required<
  Pick<ProviderEnvSnapshot, "veo" | "omni_flash" | "kling" | "runway" | "heygen" | "external">
> {
  const flags = envProviderFlags();
  return {
    veo: snapshot?.veo ?? flags.veo,
    omni_flash: snapshot?.omni_flash ?? flags.omni_flash,
    kling: snapshot?.kling ?? flags.kling,
    runway: snapshot?.runway ?? flags.runway,
    heygen: snapshot?.heygen ?? flags.heygen,
    external: snapshot?.external ?? Boolean(flags.external && flags.baseUrl),
  };
}

export function estimateProviderCost(
  provider: ProviderV2Id,
  input: { durationSec: number; quality: RouterQuality; avatarRequired?: boolean },
): ProviderCostEstimate {
  const durationSec = Math.max(1, input.durationSec);
  const qualityMul = input.quality === "high" ? 1.5 : input.quality === "draft" ? 0.75 : 1;
  const avatarMul = input.avatarRequired ? 2 : 1;

  if (provider === "veo" && veoConfigured()) {
    const credits = Math.max(1, Math.ceil(durationSec * VEO_COST_PER_SEC * 100 * qualityMul));
    return { provider, credits, currency: "credits", durationSec, quality: input.quality };
  }

  if (provider === "omni_flash") {
    const credits = Math.max(1, Math.ceil(durationSec * OMNI_FLASH_COST_PER_SEC * 100 * qualityMul));
    return { provider, credits, currency: "credits", durationSec, quality: input.quality };
  }

  const credits = Math.max(1, Math.ceil((durationSec / 5) * COST_WEIGHT[provider] * qualityMul * avatarMul));
  return { provider, credits, currency: "credits", durationSec, quality: input.quality };
}

function configuredOf(id: ProviderV2Id, env: ReturnType<typeof readProviderEnv>): boolean {
  return Boolean(env[id]);
}

function statusOf(
  id: ProviderV2Id,
  env: ReturnType<typeof readProviderEnv>,
  health?: ProviderEnvSnapshot["health"],
): ProviderV2Status {
  if (health?.[id]) return health[id]!;
  if (!configuredOf(id, env)) return "unconfigured";
  return "ready";
}

function unconfiguredHandle(id: ProviderV2Id, idempotencyKey: string): never {
  throw new ProviderRouterError(`${id} is unconfigured.`, "unconfigured");
}

export function mapV1ResultToHandle(
  id: ProviderV2Id,
  idempotencyKey: string,
  result: VideoProviderClipResult,
): ProviderJobHandle {
  const failed = result.status !== "completed" && result.status !== "processing";
  return {
    provider: id,
    status: result.status === "completed" ? "succeeded" : result.status === "processing" ? "processing" : "failed",
    externalJobId: result.externalJobId,
    idempotencyKey,
    message: failed ? result.error || result.message : result.message,
    mimeType: result.mimeType,
    remoteUrl: result.remoteUrl,
    bytes: result.bytes,
    errorCode: failed ? result.errorCode || (result.error ? "provider_failed" : undefined) : undefined,
  };
}

function wrapV1(
  id: ProviderV2Id,
  v1: VideoProvider,
  env: ReturnType<typeof readProviderEnv>,
  health?: ProviderEnvSnapshot["health"],
  healthProbe?: () => Promise<ProviderHealth>,
): VideoProviderV2 {
  return {
    id,
    label: v1.label,
    status: () => {
      if (id === "veo" && isVeoQuotaDegraded()) return "degraded";
      return statusOf(id, env, health);
    },
    capabilities: () => CAPABILITIES[id],
    estimateCost: (input) => estimateProviderCost(id, input),
    health: () => {
      const status = statusOf(id, env, health);
      if (id === "veo" && isVeoQuotaDegraded()) {
        const availability = getVeoGenerationAvailability();
        return { ok: false, status: "degraded", reason: availability.reason };
      }
      if (status === "unconfigured") {
        return { ok: false, status, reason: `${id} API key is not configured.` };
      }
      if (status === "down") {
        return { ok: false, status, reason: `${id} is marked down by health probe.` };
      }
      if (status === "degraded") {
        return { ok: false, status, reason: `${id} is degraded.` };
      }
      return { ok: true, status: "ready", reason: `${id} is configured.` };
    },
    async createJob(request: ProviderJobRequest): Promise<ProviderJobHandle> {
      if (statusOf(id, env, health) !== "ready") {
        return unconfiguredHandle(id, request.idempotencyKey);
      }
      if (healthProbe) {
        const probe = await healthProbe();
        if (!probe.ok) {
          throw new ProviderRouterError(probe.reason, probe.status === "degraded" ? "degraded" : "unconfigured");
        }
      }
      const result = await v1.generateClip({
        prompt: request.prompt,
        durationSec: request.durationSec,
        aspectRatio: request.aspectRatio || "16:9",
        imageUrl: request.imageUrl,
        avatar: request.avatar
          ? { personaId: request.avatar.personaId || "default", script: request.avatar.script || request.prompt }
          : undefined,
      });
      return mapV1ResultToHandle(id, request.idempotencyKey, result);
    },
    async pollJob(externalJobId: string, idempotencyKey: string): Promise<ProviderJobHandle> {
      if (statusOf(id, env, health) !== "ready") {
        return unconfiguredHandle(id, idempotencyKey);
      }
      if (!v1.pollJob) {
        return {
          provider: id,
          status: "processing",
          externalJobId,
          idempotencyKey,
          message: `${id} does not expose an additional poll endpoint.`,
        };
      }
      const result = await v1.pollJob(externalJobId);
      return {
        ...mapV1ResultToHandle(id, idempotencyKey, result),
        externalJobId: result.externalJobId || externalJobId,
      };
    },
    async cancelJob(_externalJobId: string, idempotencyKey: string): Promise<ProviderJobHandle> {
      if (statusOf(id, env, health) !== "ready") {
        return unconfiguredHandle(id, idempotencyKey);
      }
      return {
        provider: id,
        status: "cancelled",
        idempotencyKey,
        message: `${id} does not expose a cancel API; job was not cancelled.`,
      };
    },
  };
}

async function veoHealth(): Promise<ProviderHealth> {
  const availability = getVeoGenerationAvailability();
  if (availability.status === "unconfigured") {
    return { ok: false, status: "unconfigured", reason: availability.reason };
  }
  if (availability.status === "degraded") {
    return { ok: false, status: "degraded", reason: availability.reason };
  }
  const probe = await probeVeoHealth();
  if (probe.ok) return { ok: true, status: "ready", reason: probe.reason };
  if (/quota|RESOURCE_EXHAUSTED|429/i.test(probe.reason)) {
    return { ok: false, status: "degraded", reason: probe.reason };
  }
  if (/degraded|5\d\d/i.test(probe.reason)) {
    return { ok: false, status: "degraded", reason: probe.reason };
  }
  return { ok: false, status: "down", reason: probe.reason };
}

export function createProviderRegistry(snapshot?: ProviderEnvSnapshot): Record<ProviderV2Id, VideoProviderV2> {
  const env = readProviderEnv(snapshot);
  const health = snapshot?.health;
  return {
    veo: wrapV1("veo", veoVideoProvider, env, health, veoHealth),
    omni_flash: wrapV1("omni_flash", omniFlashVideoProvider, env, health),
    kling: wrapV1("kling", klingVideoProvider, env, health),
    runway: wrapV1("runway", runwayVideoProvider, env, health),
    heygen: wrapV1("heygen", heygenVideoProvider, env, health),
    external: wrapV1("external", externalVideoProvider, env, health),
  };
}

export function listProviderRegistry(snapshot?: ProviderEnvSnapshot): VideoProviderV2[] {
  return Object.values(createProviderRegistry(snapshot));
}

export function getProviderV2(id: ProviderV2Id, snapshot?: ProviderEnvSnapshot): VideoProviderV2 {
  return createProviderRegistry(snapshot)[id];
}

export { CAPABILITIES };
