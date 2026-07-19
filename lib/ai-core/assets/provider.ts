/**
 * AI Real Images Engine — provider façade.
 * Image providers only (OpenAI DALL·E / Replicate Flux / Stability).
 * DeepSeek remains text/code only.
 */

import {
  getDefaultImageSettings,
  type ImageGenerationSettings,
} from "@/lib/ai-core/assets/settings";
import {
  generateWithImageProviders,
  isAnyImageProviderConfigured,
} from "@/lib/ai-core/assets/providers/router";

export type GenerateImageOptions = {
  settings?: Partial<ImageGenerationSettings>;
  negativePrompt?: string;
};

export async function generateRealisticImage(
  prompt: string,
  options?: GenerateImageOptions,
): Promise<{
  bytes: Buffer;
  mimeType: string;
  provider: string;
  model?: string;
  width?: number;
  height?: number;
} | null> {
  const settings = getDefaultImageSettings(options?.settings);
  const result = await generateWithImageProviders(
    {
      prompt,
      aspectRatio: settings.aspectRatio,
      quality: settings.quality,
      negativePrompt: options?.negativePrompt,
    },
    settings,
  );
  if (!result) return null;
  return {
    bytes: result.bytes,
    mimeType: result.mimeType,
    provider: result.provider,
    model: result.model,
    width: result.width,
    height: result.height,
  };
}

export function svgFallbackDataUrl(
  label: string,
  primary: string,
  secondary: string,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <text x="80" y="820" fill="rgba(255,255,255,0.85)" font-family="Georgia, serif" font-size="48">${label.replace(/[<>&']/g, "")}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function isImageProviderConfigured(): boolean {
  return isAnyImageProviderConfigured();
}
