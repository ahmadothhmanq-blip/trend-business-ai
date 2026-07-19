import {
  openaiSizeForAspect,
  pixelsForAspect,
} from "@/lib/ai-core/assets/settings";
import type { ImageProviderAdapter } from "@/lib/ai-core/assets/providers/types";
import {
  clampImagePrompt,
  getImageGenerationTimeoutMs,
} from "@/lib/ai/timeouts";

export const openaiImageProvider: ImageProviderAdapter = {
  id: "openai",
  label: "OpenAI DALL·E",
  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY?.trim());
  },
  async generate(request) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return null;

    const size = openaiSizeForAspect(request.aspectRatio);
    const pixels = pixelsForAspect(request.aspectRatio);
    const quality = request.quality === "hd" ? "hd" : "standard";

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: clampImagePrompt(request.prompt),
          n: 1,
          size,
          response_format: "b64_json",
          quality,
        }),
        signal: AbortSignal.timeout(getImageGenerationTimeoutMs()),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.error(
          "AI Real Images: OpenAI failed",
          response.status,
          text.slice(0, 400),
        );
        return null;
      }

      const json = (await response.json()) as {
        data?: Array<{ b64_json?: string }>;
      };
      const b64 = json.data?.[0]?.b64_json;
      if (!b64) return null;

      return {
        bytes: Buffer.from(b64, "base64"),
        mimeType: "image/png",
        provider: "openai",
        model: "dall-e-3",
        width: pixels.width,
        height: pixels.height,
      };
    } catch (error) {
      console.error("AI Real Images: OpenAI threw", error);
      return null;
    }
  },
};
