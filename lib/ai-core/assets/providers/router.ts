import type {
  ImageGenerationSettings,
  ImageProviderId,
} from "@/lib/ai-core/assets/settings";
import { openaiImageProvider } from "@/lib/ai-core/assets/providers/openai";
import { replicateImageProvider } from "@/lib/ai-core/assets/providers/replicate";
import { stabilityImageProvider } from "@/lib/ai-core/assets/providers/stability";
import type {
  ImageProviderAdapter,
  ImageProviderRequest,
  ImageProviderResult,
} from "@/lib/ai-core/assets/providers/types";

const PROVIDERS: ImageProviderAdapter[] = [
  openaiImageProvider,
  replicateImageProvider,
  stabilityImageProvider,
];

export function listImageProviders(): ImageProviderAdapter[] {
  return PROVIDERS;
}

export function listConfiguredImageProviders(): ImageProviderId[] {
  return PROVIDERS.filter((p) => p.isConfigured()).map((p) => p.id);
}

export function isAnyImageProviderConfigured(): boolean {
  return listConfiguredImageProviders().length > 0;
}

function providerOrder(preferred?: ImageProviderId): ImageProviderAdapter[] {
  if (!preferred) return PROVIDERS;
  const head = PROVIDERS.filter((p) => p.id === preferred);
  const rest = PROVIDERS.filter((p) => p.id !== preferred);
  return [...head, ...rest];
}

/**
 * Try preferred provider, then other configured image providers.
 * Does not use DeepSeek (text-only).
 */
export async function generateWithImageProviders(
  request: ImageProviderRequest,
  settings?: Pick<ImageGenerationSettings, "preferredProvider">,
): Promise<ImageProviderResult | null> {
  for (const provider of providerOrder(settings?.preferredProvider)) {
    if (!provider.isConfigured()) continue;
    const result = await provider.generate(request);
    if (result) return result;
  }
  return null;
}
