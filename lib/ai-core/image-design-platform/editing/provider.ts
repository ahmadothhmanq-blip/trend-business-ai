/**
 * Image editing providers — wraps raster generation for variations; stubs for advanced ops.
 */

import {
  generateWithImageProviders,
  isAnyImageProviderConfigured,
} from "@/lib/ai-core/assets/providers/router";
import type {
  ImageEditOperation,
  ImageEditRequest,
  ImageEditResult,
  ImageEditingProvider,
} from "@/lib/ai-core/image-design-platform/editing/types";

function dataUrlToBase64(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  return match?.[1] ?? null;
}

const replicateProvider: ImageEditingProvider = {
  id: "replicate-edit",
  label: "Replicate Edit",
  isConfigured: () => Boolean(process.env.REPLICATE_API_TOKEN?.trim()),
  supports: (op) => ["variation", "upscale", "enhance"].includes(op),
  async edit(request) {
    if (request.operation === "variation" && request.prompt) {
      const result = await generateWithImageProviders({
        prompt: request.prompt,
        negativePrompt: "",
        aspectRatio: "1:1",
        quality: "standard",
      });
      if (!result) return null;
      const dataUrl = `data:${result.mimeType};base64,${result.bytes.toString("base64")}`;
      return {
        operation: request.operation,
        status: "completed",
        outputDataUrl: dataUrl,
        provider: result.provider,
        message: "Variation generated via image provider.",
      };
    }
    return null;
  },
};

const localFallbackProvider: ImageEditingProvider = {
  id: "local-fallback",
  label: "Local Fallback",
  isConfigured: () => true,
  supports: () => true,
  async edit(request) {
    const src = request.imageDataUrl ?? request.imageUrl;
    if (!src) {
      return {
        operation: request.operation,
        status: "failed",
        provider: "local-fallback",
        message: "No source image provided.",
      };
    }

    if (request.operation === "background_removal") {
      return {
        operation: request.operation,
        status: "fallback",
        outputDataUrl: src,
        provider: "local-fallback",
        message: "Background removal preview — configure Replicate or Stability for production cutout.",
      };
    }

    if (request.operation === "upscale") {
      return {
        operation: request.operation,
        status: "fallback",
        outputDataUrl: src,
        provider: "local-fallback",
        message: `Upscale ${request.scale ?? 2}x queued — connect image provider for true upscale.`,
      };
    }

    if (request.operation === "enhance") {
      return {
        operation: request.operation,
        status: "fallback",
        outputDataUrl: src,
        provider: "local-fallback",
        message: "Enhancement preview — connect image provider for production enhance.",
      };
    }

    if (request.operation === "object_replace") {
      return {
        operation: request.operation,
        status: "fallback",
        outputDataUrl: src,
        provider: "local-fallback",
        message: "Object replacement foundation — mask + prompt pipeline ready for provider wiring.",
      };
    }

    if (request.operation === "variation" && request.prompt) {
      if (isAnyImageProviderConfigured()) {
        const result = await generateWithImageProviders({
          prompt: request.prompt,
          negativePrompt: "",
          aspectRatio: "1:1",
          quality: "standard",
        });
        if (result) {
          const dataUrl = `data:${result.mimeType};base64,${result.bytes.toString("base64")}`;
          return {
            operation: request.operation,
            status: "completed",
            outputDataUrl: dataUrl,
            provider: result.provider,
          };
        }
      }
      return {
        operation: request.operation,
        status: "fallback",
        provider: "local-fallback",
        message: "Variation requires configured image provider.",
      };
    }

    return {
      operation: request.operation,
      status: "failed",
      provider: "local-fallback",
      message: "Unsupported edit request.",
    };
  },
};

const PROVIDERS: ImageEditingProvider[] = [replicateProvider, localFallbackProvider];

export function listImageEditingProviders(): ImageEditingProvider[] {
  return PROVIDERS;
}

export function getEditingProviderFor(operation: ImageEditOperation): ImageEditingProvider | null {
  return (
    PROVIDERS.find((p) => p.isConfigured() && p.supports(operation)) ??
    PROVIDERS.find((p) => p.supports(operation)) ??
    null
  );
}

export async function runImageEdit(request: ImageEditRequest): Promise<ImageEditResult> {
  const provider = getEditingProviderFor(request.operation);
  if (!provider) {
    return {
      operation: request.operation,
      status: "failed",
      provider: "none",
      message: "No editing provider available.",
    };
  }
  const result = await provider.edit(request);
  return (
    result ?? {
      operation: request.operation,
      status: "failed",
      provider: provider.id,
      message: "Edit operation returned no result.",
    }
  );
}

export { dataUrlToBase64 };
