/**
 * Video provider registry.
 */

import type { VideoProvider, VideoProviderId } from "@/lib/ai-core/video-production-platform/providers/types";
import { resolvePreferredProviderId } from "@/lib/ai-core/video-production-platform/providers/types";
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

export function listVideoProviders(): VideoProvider[] {
  return Object.values(REGISTRY);
}

export function getVideoProvider(id?: VideoProviderId | string): VideoProvider {
  if (id && id in REGISTRY) return REGISTRY[id as VideoProviderId]!;
  return REGISTRY[resolvePreferredProviderId()]!;
}

export function getConfiguredVideoProviders(): VideoProvider[] {
  return listVideoProviders().filter((p) => p.configured || p.id === "preview");
}
