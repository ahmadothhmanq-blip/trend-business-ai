/**
 * AI Product Presenter — upload product image → presenter video package.
 */

import type { VideoPluginInput } from "@/plugins/video-studio/types";
import type { VideoBrandOverlay } from "@/lib/ai-core/video-production-platform/types";
import { matchVideoTemplate } from "@/lib/ai-core/video-production-platform/templates";
import { presenterPromptBlock, buildPresenterProfile } from "@/lib/ai-core/video-production-platform/presenters";

export type ProductPresenterInput = {
  productName: string;
  productDescription: string;
  productImageUrl: string;
  category?: "clothing" | "electronics" | "cars" | "beauty" | "food" | "other";
  language?: string;
  duration?: string;
  brand?: VideoBrandOverlay;
  aspectRatio?: string;
};

export function buildProductPresenterBrief(
  input: ProductPresenterInput,
): {
  pluginInput: VideoPluginInput;
  templateId: string;
  presenterBlock: string;
  enrichedPrompt: string;
} {
  const template = matchVideoTemplate({
    prompt: `${input.productName} ${input.category || ""} product presenter`,
    contentType: "product-ad",
  });
  const presenter = buildPresenterProfile(template.presenterPersona, {
    language: input.language || "English",
  });

  const enrichedPrompt = [
    `Create an advanced product presenter video for "${input.productName}".`,
    `Category: ${input.category || "other"}.`,
    `Product description: ${input.productDescription}`,
    `Product image reference URL: ${input.productImageUrl}`,
    `Pipeline requirements:`,
    `- AI human presenter introducing and explaining the product`,
    `- Scene-by-scene product story (hook → features → demo → proof → CTA)`,
    `- Voice narration matched to presenter style and language`,
    `- Captions/subtitles for social export`,
    `- Branding end-card and on-screen product callouts`,
    `- Motion suitable for image-to-video / avatar render of the product image`,
    `Brand: ${input.brand?.businessName || "Brand"} colors ${input.brand?.primary || ""}.`,
    presenterPromptBlock(presenter),
    `Environment: ${template.environment}`,
    `Camera: ${template.cameraStyle}`,
    `Script structure: ${template.scriptStructure.join(" → ")}`,
  ].join("\n");

  return {
    pluginInput: {
      prompt: enrichedPrompt,
      videoType: "product-demo",
      style: template.visualStyle,
      aspectRatio: input.aspectRatio || "9:16",
      duration: input.duration || `${template.recommendedDurationSec}s`,
      mood: "Professional",
      cameraMove: "Orbit",
      options: [
        "script",
        "voiceover",
        "subtitles",
        "branded",
        "cta",
        "thumbnail",
        "music",
        "presenter",
        "product-closeups",
      ],
      sceneCount: Math.min(8, template.scriptStructure.length + 1),
    },
    templateId: template.id,
    presenterBlock: presenterPromptBlock(presenter),
    enrichedPrompt,
  };
}
