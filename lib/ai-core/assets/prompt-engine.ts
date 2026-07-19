import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import { planCoreAssets } from "@/lib/ai-core/assets/plan";
import {
  getDefaultImageSettings,
  normalizeImageStyle,
  stylePromptFragment,
  type ImageGenerationSettings,
} from "@/lib/ai-core/assets/settings";
import type { CoreAssetPlanItem } from "@/lib/ai-core/assets/types";

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
 * Build image prompts from strategy/design/template, optionally refined by DeepSeek (text only).
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
  const style = normalizeImageStyle(
    params.settings?.style ||
      params.templateSelection?.designPreset ||
      params.designSystem.stylePreset ||
      params.designSystem.style,
  );
  const settings = getDefaultImageSettings({
    ...params.settings,
    style,
  });

  const planned = planCoreAssets({
    strategy: params.strategy,
    designSystem: params.designSystem,
    profile: params.profile,
    maxItems: params.maxItems ?? 5,
  });

  const styleFrag = stylePromptFragment(settings.style);
  const templateHint = params.templateSelection?.smartTemplateId
    ? `Template ${params.templateSelection.smartTemplateId} (${params.templateSelection.label}).`
    : "";

  let items: CoreAssetPlanItem[] = planned.map((item) => ({
    ...item,
    prompt: `${item.prompt} Visual style: ${styleFrag}. ${templateHint}`.trim(),
  }));

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (resolved) {
    params.onProgress?.(
      "DeepSeek refining image prompts for hero/product/service visuals...",
    );
    try {
      const enrichment = await providerManager.generateJson<PromptEnrichment>(
        {
          system:
            "You write concise photorealistic image prompts for a website. No text overlays, no logos, no watermarks. Return JSON only.",
          prompt: `Business: ${params.profile?.projectName || "Brand"}
Industry: ${params.profile?.industry || params.designSystem.industryPattern}
Offer: ${params.profile?.offer || params.strategy.positioning}
Style preset: ${settings.style}
Template: ${params.templateSelection?.label || "n/a"}

Planned assets:
${JSON.stringify(
  items.map((i) => ({ id: i.id, kind: i.kind, role: i.role, name: i.name, prompt: i.prompt })),
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
          return {
            ...item,
            prompt: String(row.prompt),
            alt: typeof row.alt === "string" && row.alt.trim() ? row.alt : item.alt,
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
      "text, watermark, logo, UI mockup, blurry, low quality, distorted anatomy",
  };
}
