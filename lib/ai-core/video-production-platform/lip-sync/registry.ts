import type { LipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/contract";
import { heygenLipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/heygen";
import { LipSyncError } from "@/lib/ai-core/video-production-platform/lip-sync/errors";

export function listLipSyncProviders(): LipSyncProvider[] {
  return [heygenLipSyncProvider];
}

export function resolveLipSyncProvider(preferred?: string): LipSyncProvider {
  const providers = listLipSyncProviders();
  if (preferred && preferred !== "heygen") {
    throw new LipSyncError(
      `Lip-sync provider "${preferred}" is not enabled in this phase. HeyGen is the only provider.`,
      "unconfigured",
    );
  }
  const match = providers.find((provider) => provider.id === "heygen") || providers[0];
  if (!match) {
    throw new LipSyncError("No lip-sync provider is registered.", "unconfigured");
  }
  if (match.status() === "unconfigured") {
    throw new LipSyncError("HeyGen lip-sync is not configured. Set HEYGEN_API_KEY.", "unconfigured");
  }
  return match;
}

export function lipSyncProviderHealthReport() {
  return listLipSyncProviders().map((provider) => ({
    id: provider.id,
    ...provider.health(),
    capabilities: provider.capabilities(),
  }));
}
