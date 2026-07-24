/**
 * Video provider registry.
 */

import type {
  VideoProvider,
  VideoProviderId,
  VideoProviderRenderMode,
} from "@/lib/ai-core/video-production-platform/providers/types";
import {
  resolvePreferredProviderId,
  resolveVideoProviderForMode,
} from "@/lib/ai-core/video-production-platform/providers/types";
import { previewVideoProvider } from "@/lib/ai-core/video-production-platform/providers/preview";
import { runwayVideoProvider } from "@/lib/ai-core/video-production-platform/providers/runway";
import { klingVideoProvider } from "@/lib/ai-core/video-production-platform/providers/kling";
import { heygenVideoProvider } from "@/lib/ai-core/video-production-platform/providers/heygen";
import { externalVideoProvider } from "@/lib/ai-core/video-production-platform/providers/external";

export * from "@/lib/ai-core/video-production-platform/providers/types";
export { previewVideoProvider } from "@/lib/ai-core/video-production-platform/providers/preview";
export { runwayVideoProvider } from "@/lib/ai-core/video-production-platform/providers/runway";
export { klingVideoProvider } from "@/lib/ai-core/video-production-platform/providers/kling";
export { heygenVideoProvider } from "@/lib/ai-core/video-production-platform/providers/heygen";

const REGISTRY: Record<VideoProviderId, VideoProvider> = {
  preview: previewVideoProvider,
  runway: runwayVideoProvider,
  kling: klingVideoProvider,
  heygen: heygenVideoProvider,
  external: externalVideoProvider,
};

export class ProviderNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderNotConfiguredError";
  }
}

export function listVideoProviders(): VideoProvider[] {
  return Object.values(REGISTRY);
}

export function getVideoProvider(id?: VideoProviderId | string): VideoProvider {
  if (id && id in REGISTRY) return REGISTRY[id as VideoProviderId]!;
  return REGISTRY[resolvePreferredProviderId()]!;
}

/** Resolve provider by render mode; throws when configuration is missing. */
export function getVideoProviderForMode(
  mode: VideoProviderRenderMode = "full",
  explicitId?: VideoProviderId | string,
): VideoProvider {
  const resolution = resolveVideoProviderForMode(mode, explicitId);
  if (resolution.error) {
    throw new ProviderNotConfiguredError(resolution.error);
  }
  return REGISTRY[resolution.providerId]!;
}

export function getConfiguredVideoProviders(): VideoProvider[] {
  return listVideoProviders().filter((p) => p.configured || p.id === "preview");
}
