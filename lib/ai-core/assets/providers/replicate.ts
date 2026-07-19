import { pixelsForAspect } from "@/lib/ai-core/assets/settings";
import type { ImageProviderAdapter } from "@/lib/ai-core/assets/providers/types";

const DEFAULT_FLUX_MODEL =
  process.env.REPLICATE_FLUX_MODEL?.trim() ||
  "black-forest-labs/flux-schnell";

async function fetchImageBytes(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

/**
 * Replicate Flux image generation.
 * Requires REPLICATE_API_TOKEN.
 */
export const replicateImageProvider: ImageProviderAdapter = {
  id: "replicate",
  label: "Replicate Flux",
  isConfigured() {
    return Boolean(process.env.REPLICATE_API_TOKEN?.trim());
  },
  async generate(request) {
    const token = process.env.REPLICATE_API_TOKEN?.trim();
    if (!token) return null;

    const pixels = pixelsForAspect(request.aspectRatio);
    const model = DEFAULT_FLUX_MODEL;

    try {
      const create = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          model,
          input: {
            prompt: request.prompt.slice(0, 3900),
            aspect_ratio: request.aspectRatio,
            output_format: "png",
            num_outputs: 1,
            ...(request.negativePrompt
              ? { negative_prompt: request.negativePrompt }
              : {}),
          },
        }),
        signal: AbortSignal.timeout(90000),
      });

      if (!create.ok) {
        const text = await create.text().catch(() => "");
        console.error(
          "AI Real Images: Replicate failed",
          create.status,
          text.slice(0, 400),
        );
        return null;
      }

      const prediction = (await create.json()) as {
        status?: string;
        output?: string | string[];
        urls?: { get?: string };
        error?: string;
      };

      let output = prediction.output;
      let status = prediction.status;

      // Poll if not ready (Prefer wait may not apply on all models)
      let getUrl = prediction.urls?.get;
      let attempts = 0;
      while (
        getUrl &&
        status !== "succeeded" &&
        status !== "failed" &&
        status !== "canceled" &&
        attempts < 30
      ) {
        await new Promise((r) => setTimeout(r, 2000));
        const poll = await fetch(getUrl, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(30000),
        });
        if (!poll.ok) break;
        const body = (await poll.json()) as typeof prediction;
        status = body.status;
        output = body.output;
        getUrl = body.urls?.get ?? getUrl;
        attempts += 1;
      }

      if (status === "failed" || prediction.error) {
        console.error("AI Real Images: Replicate error", prediction.error);
        return null;
      }

      const url = Array.isArray(output) ? output[0] : output;
      if (!url || typeof url !== "string") return null;

      const bytes = await fetchImageBytes(url);
      if (!bytes) return null;

      return {
        bytes,
        mimeType: "image/png",
        provider: "replicate",
        model,
        width: pixels.width,
        height: pixels.height,
      };
    } catch (error) {
      console.error("AI Real Images: Replicate threw", error);
      return null;
    }
  },
};
