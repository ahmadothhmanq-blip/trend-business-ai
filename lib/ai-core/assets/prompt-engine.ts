import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import {
  getDefaultImageSettings,
  type ImageGenerationSettings,
} from "@/lib/ai-core/assets/settings";
import type { CoreAssetPlanItem } from "@/lib/ai-core/assets/types";
import {
  buildImageIntelligence,
  planWebsiteImages,
} from "@/lib/ai-core/image-engine";

type PromptEnrichment = {
  items: Array<{
    id?: string;
    kind?: string;
    prompt?: string;
    alt?: string;
    negativePrompt?: string;
  }>;
};

/**
 * Build image prompts via AI Image Engine intelligence
 * (Industry + Premium Design + Templates + Design Renderer sections).
 */
export async function buildImagePrompts(params: {
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  templateSelection?: TemplateSelection;
  settings?: Partial<ImageGenerationSettings>;
  maxItems?: number;
  onProgress?: (message: string) => void;
}): Promise<{
  items: CoreAssetPlanItem[];
  settings: ImageGenerationSettings;
  negativePrompt?: string;
}> {
  const intel = buildImageIntelligence({
    strategy: params.strategy,
    designSystem: params.designSystem,
    profile: params.profile,
    templateSelection: params.templateSelection,
    preferredStyle: params.settings?.style,
  });

  const settings = getDefaultImageSettings({
    ...params.settings,
    style: intel.imageStyle,
  });

  let items: CoreAssetPlanItem[] = planWebsiteImages({
    strategy: params.strategy,
    designSystem: params.designSystem,
    profile: params.profile,
    templateSelection: params.templateSelection,
    preferredStyle: settings.style,
    maxItems: params.maxItems ?? 8,
  }).map((item) => ({
    id: item.id,
    kind: item.kind,
    role: item.role,
    name: item.name,
    prompt: item.prompt,
    alt: item.alt,
    realistic: item.realistic,
    metadata: item.metadata,
  }));

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (resolved) {
    params.onProgress?.(
      "AI Image Engine: DeepSeek refining image prompts...",
    );
    try {
      const enrichment = await providerManager.generateJson<PromptEnrichment>(
        {
          system:
            "You write concise photorealistic image prompts for a website. No text overlays, no logos, no watermarks. Return JSON only.",
          prompt: `Business: ${params.profile?.projectName || "Brand"}
Industry: ${intel.industry}
Offer: ${intel.offer}
Style preset: ${settings.style}
Brand style: ${intel.brandStyle}
Design system: ${intel.designStyle}
Target audience: ${intel.targetAudience}
Image requirements: ${intel.imageRequirements.join("; ") || "n/a"}
Template: ${params.templateSelection?.label || "n/a"}

Planned assets:
${JSON.stringify(
  items.map((i) => ({
    id: i.id,
    kind: i.kind,
    role: i.role,
    name: i.name,
    purpose: i.metadata?.purpose,
    prompt: i.prompt,
  })),
  null,
  2,
)}

Return JSON:
{
  "items": [
    { "id": "<same id>", "prompt": "<improved prompt>", "alt": "<alt>", "negativePrompt": "optional" }
  ]
}`,
          temperature: 0.4,
        },
        resolved,
      );

      if (Array.isArray(enrichment.items) && enrichment.items.length) {
        const byId = new Map(
          enrichment.items
            .filter((row) => row && typeof row.id === "string")
            .map((row) => [String(row.id), row]),
        );
        items = items.map((item) => {
          const row = byId.get(item.id);
          if (!row?.prompt) return item;
          const prompt = String(row.prompt);
          return {
            ...item,
            prompt,
            alt:
              typeof row.alt === "string" && row.alt.trim()
                ? row.alt
                : item.alt,
            metadata: item.metadata
              ? { ...item.metadata, prompt }
              : item.metadata,
          };
        });
      }
    } catch {
      // Keep deterministic prompts
    }
  }

  return {
    items,
    settings,
    negativePrompt:
      "text, watermark, logo, UI mockup, blurry, low quality, distorted anatomy, placeholder",
  };
}
