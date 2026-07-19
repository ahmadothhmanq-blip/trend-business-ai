import type {
  ImageAspectRatio,
  ImageProviderId,
  ImageQuality,
} from "@/lib/ai-core/assets/settings";

export type ImageProviderResult = {
  bytes: Buffer;
  mimeType: string;
  provider: string;
  model: string;
  width?: number;
  height?: number;
};

export type ImageProviderRequest = {
  prompt: string;
  aspectRatio: ImageAspectRatio;
  quality: ImageQuality;
  /** Optional negative prompt (Stability / Flux). */
  negativePrompt?: string;
};

export type ImageProviderAdapter = {
  id: ImageProviderId;
  label: string;
  isConfigured: () => boolean;
  generate: (request: ImageProviderRequest) => Promise<ImageProviderResult | null>;
};
