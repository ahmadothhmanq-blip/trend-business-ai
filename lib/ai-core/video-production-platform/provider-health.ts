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
    if (strictMode) blockers.push(fullResolution.error);
    else warnings.push(fullResolution.error);
  }
  if (avatarResolution.error) {
    warnings.push(avatarResolution.error);
  }

  if (!klingConfigured) {
    warnings.push("KLING_API_KEY unset — full renders use preview stubs or fallback providers.");
  }
  if (!ttsConfigured) {
    warnings.push("No TTS key — full renders use silent preview WAV.");
  }
  if (!strictMode) {
    warnings.push("VIDEO_PROVIDER_STRICT unset — provider errors may return stub MP4 clips.");
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
      klingConfigured &&
      fullResolution.providerId === "kling" &&
      !fullResolution.error,
    avatarRenderReady: flags.heygen && !avatarResolution.error,
    klingConfigured,
    strictMode,
    ttsConfigured,
    blockers,
    warnings,
  };
}
