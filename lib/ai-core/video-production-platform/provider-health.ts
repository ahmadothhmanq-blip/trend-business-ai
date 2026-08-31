/**
 * Automatic Video Studio provider health checks (routing + configuration).
 */

import {
  envProviderFlags,
  resolveVideoProviderForMode,
  type VideoProviderId,
} from "@/lib/ai-core/video-production-platform/providers/types";
import { isKlingVideoProviderConfigured } from "@/lib/ai-core/video-production-platform/render-engine";
import { isTtsProviderConfigured } from "@/lib/ai-core/video-production-platform/tts";
import { probeFfmpegHealth } from "@/lib/ai-core/video-production-platform/assemble";
import { isStrictVideoProviderMode } from "@/lib/ai-core/video-production-platform/providers/types";

export type ProviderHealthEntry = {
  id: VideoProviderId;
  label: string;
  role: "preview" | "full-render" | "avatar" | "fallback";
  configured: boolean;
  ready: boolean;
  message: string;
};

export type ProviderHealthReport = {
  providers: ProviderHealthEntry[];
  fullRenderProvider: VideoProviderId;
  avatarProvider: VideoProviderId;
  previewProvider: VideoProviderId;
  fullRenderReady: boolean;
  avatarRenderReady: boolean;
  klingConfigured: boolean;
  strictMode: boolean;
  ttsConfigured: boolean;
  blockers: string[];
  warnings: string[];
};

export async function buildProviderHealthReport(): Promise<ProviderHealthReport> {
  const flags = envProviderFlags();
  const fullResolution = resolveVideoProviderForMode("full");
  const avatarResolution = resolveVideoProviderForMode("avatar");
  const previewResolution = resolveVideoProviderForMode("preview");

  const klingConfigured = isKlingVideoProviderConfigured();
  const strictMode = isStrictVideoProviderMode();
  const ttsConfigured = isTtsProviderConfigured();

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (fullResolution.error) {
    warnings.push(fullResolution.error);
  }
  if (avatarResolution.error) {
    warnings.push(avatarResolution.error);
  }

  if (!flags.veo && !klingConfigured && !flags.runway && !flags.external) {
    warnings.push("No full-render provider — set GEMINI_API_KEY/VEO_API_KEY, KLING_API_KEY, RUNWAY_API_KEY, or VIDEO_PROVIDER_API_KEY.");
  } else if (!klingConfigured) {
    warnings.push("KLING_API_KEY unset — full render needs Kling, Veo, Runway, or an external video provider.");
  }
  if (!ttsConfigured) {
    warnings.push("No TTS key — set ELEVENLABS_API_KEY or OPENAI_API_KEY.");
  }
  if (!strictMode) {
    warnings.push("VIDEO_PROVIDER_STRICT must be 1 in production.");
  }

  const ffmpeg = await probeFfmpegHealth();
  if (!ffmpeg.available) {
    warnings.push("FFmpeg unavailable — multi-scene merge degraded.");
  }

  const providers: ProviderHealthEntry[] = [
    {
      id: "preview",
      label: "Preview Stub",
      role: "preview",
      configured: true,
      ready: true,
      message: "Available for storyboard / poster preview renders.",
    },
    {
      id: "veo",
      label: "Veo",
      role: "full-render",
      configured: flags.veo,
      ready: flags.veo && fullResolution.providerId === "veo",
      message: flags.veo
        ? "Veo/Gemini full-render provider."
        : "Set GEMINI_API_KEY or VEO_API_KEY for Veo.",
    },
    {
      id: "kling",
      label: "Kling",
      role: "full-render",
      configured: flags.kling,
      ready: flags.kling && fullResolution.providerId === "kling",
      message: flags.kling
        ? "Primary full-render provider."
        : "Set KLING_API_KEY for production scene clips.",
    },
    {
      id: "heygen",
      label: "HeyGen",
      role: "avatar",
      configured: flags.heygen,
      ready: flags.heygen && !avatarResolution.error,
      message: flags.heygen
        ? avatarResolution.error || "Avatar lane ready."
        : "Set HEYGEN_API_KEY (+ avatar/voice IDs) for avatar renders.",
    },
    {
      id: "runway",
      label: "Runway",
      role: "fallback",
      configured: flags.runway,
      ready: flags.runway && !flags.kling,
      message: flags.runway
        ? "Fallback when Kling is unset."
        : "Optional premium fallback.",
    },
    {
      id: "external",
      label: "External API",
      role: "fallback",
      configured: flags.external,
      ready: flags.external && !flags.kling && !flags.runway,
      message: flags.external
        ? "Generic external video API configured."
        : "Optional custom provider.",
    },
  ];

  return {
    providers,
    fullRenderProvider: fullResolution.providerId,
    avatarProvider: avatarResolution.providerId,
    previewProvider: previewResolution.providerId,
    fullRenderReady:
      !fullResolution.error && fullResolution.providerId !== "preview",
    avatarRenderReady: flags.heygen && !avatarResolution.error,
    klingConfigured,
    strictMode,
    ttsConfigured,
    blockers,
    warnings,
  };
}
