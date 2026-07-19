import { pixelsForAspect } from "@/lib/ai-core/assets/settings";
import type { ImageProviderAdapter } from "@/lib/ai-core/assets/providers/types";
import {
  clampImagePrompt,
  getImageGenerationTimeoutMs,
} from "@/lib/ai/timeouts";

/**
 * Stability AI text-to-image (SD3 / core REST).
 * Requires STABILITY_API_KEY.
 */
export const stabilityImageProvider: ImageProviderAdapter = {
  id: "stability",
  label: "Stability AI",
  isConfigured() {
    return Boolean(process.env.STABILITY_API_KEY?.trim());
  },
  async generate(request) {
    const apiKey = process.env.STABILITY_API_KEY?.trim();
    if (!apiKey) return null;

    const pixels = pixelsForAspect(request.aspectRatio);
    const model =
      process.env.STABILITY_IMAGE_MODEL?.trim() || "sd3.5-large";

    try {
      const form = new FormData();
      form.append("prompt", clampImagePrompt(request.prompt));
      form.append("output_format", "png");
      form.append("aspect_ratio", request.aspectRatio);
      form.append("model", model);
      if (request.negativePrompt) {
        form.append("negative_prompt", request.negativePrompt);
      }

      const response = await fetch(
        "https://api.stability.ai/v2beta/stable-image/generate/sd3",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "image/*",
          },
          body: form,
          signal: AbortSignal.timeout(getImageGenerationTimeoutMs()),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error(
          "AI Real Images: Stability failed",
          response.status,
          text.slice(0, 400),
        );
        return null;
      }

      const ab = await response.arrayBuffer();
      if (!ab.byteLength) return null;

      return {
        bytes: Buffer.from(ab),
        mimeType: "image/png",
        provider: "stability",
        model,
        width: pixels.width,
        height: pixels.height,
      };
    } catch (error) {
      console.error("AI Real Images: Stability threw", error);
      return null;
    }
  },
};
