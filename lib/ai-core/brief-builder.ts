/**
 * Build product-specific CoreBriefs from the generic /api/ai-core/runs payload.
 * Does not rewrite generators — only maps request fields into existing adapter inputs.
 */

import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { AiCoreProductId } from "@/lib/ai-core/products";
import { brandInputToBrief } from "@/lib/ai-core/adapters/brand-designer";
import { contentInputToBrief } from "@/lib/ai-core/adapters/content-studio";
import { landingPageInputToBrief } from "@/lib/ai-core/adapters/landing-page-builder";
import { marketingInputToBrief } from "@/lib/ai-core/adapters/marketing-ai";
import { videoInputToBrief } from "@/lib/ai-core/adapters/video-studio";
import { webappInputToBrief } from "@/lib/ai-core/adapters/webapp-builder";
import { websiteInputToBrief } from "@/lib/ai-core/adapters/website-builder";
import type { BrandIdentityPluginInput } from "@/plugins/brand-identity/types";
import type { ContentPluginInput } from "@/plugins/content-studio/types";
import type { LandingPagePluginInput } from "@/plugins/landing-page/types";
import type { PluginBriefInput } from "@/plugins/types";
import type { VideoPluginInput } from "@/plugins/video-studio/types";
import type { WebAppPluginInput } from "@/plugins/webapp/types";
import type { WebsiteGenerationInput } from "@/plugins/website/types";

export type AiCoreRunRequestBody = {
  productId: string;
  prompt: string;
  mode?: "generate" | "regenerate" | "continue" | "retry";
  language?: string;
  theme?: string;
  features?: string[];
  continueInstruction?: string;
  parentRunId?: string;
  provider?: string;
  /** Product-specific plugin fields (merged with top-level prompt/language/theme). */
  input?: Record<string, unknown>;
  userId?: string;
};

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function strArr(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.map(String).filter(Boolean);
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function buildCoreBrief(
  canonicalProductId: AiCoreProductId,
  body: AiCoreRunRequestBody,
): CoreBrief {
  const extra = body.input ?? {};
  const prompt = body.prompt;
  const language = body.language ?? str(extra.language, "English");
  const theme = body.theme ?? str(extra.theme, "modern");
  const features = body.features ?? strArr(extra.features);

  switch (canonicalProductId) {
    case "website-builder": {
      const input: WebsiteGenerationInput = {
        prompt,
        projectType: str(extra.projectType, "business-website"),
        projectKind:
          extra.projectKind === "web_application" ? "web_application" : "website",
        language,
        theme,
        features,
        mode: body.mode,
        parentGenerationId: body.parentRunId,
        continueInstruction: body.continueInstruction,
        userId: body.userId,
        previousFiles: Array.isArray(extra.previousFiles)
          ? (extra.previousFiles as WebsiteGenerationInput["previousFiles"])
          : undefined,
      };
      return websiteInputToBrief(input);
    }
    case "app-builder": {
      const input: WebAppPluginInput = {
        prompt,
        appType: str(extra.appType, "saas"),
        language,
        designStyle: str(extra.designStyle, theme),
        colorStyle: str(extra.colorStyle, "neutral"),
        features,
      };
      return webappInputToBrief(input);
    }
    case "landing-page-builder": {
      const input: LandingPagePluginInput = {
        prompt,
        pageType: str(extra.pageType, "product"),
        language,
        designStyle: str(extra.designStyle, theme),
        colorStyle: str(extra.colorStyle, "neutral"),
        sections: strArr(extra.sections, features.length ? features : ["Hero", "Features", "CTA"]),
      };
      return landingPageInputToBrief(input);
    }
    case "brand-designer": {
      const input: BrandIdentityPluginInput = {
        prompt,
        brandName: str(extra.brandName, "Brand"),
        brandType: str(extra.brandType, "startup"),
        industry: str(extra.industry, "General"),
        targetAudience: str(extra.targetAudience, "General"),
        brandPersonality: str(extra.brandPersonality, theme || "Professional"),
        deliverables: strArr(
          extra.deliverables,
          features.length
            ? features
            : ["brand-strategy", "color-palette", "typography", "voice-tone"],
        ),
      };
      return brandInputToBrief(input);
    }
    case "content-studio": {
      const input: ContentPluginInput = {
        prompt,
        contentTool: str(extra.contentTool, "article-writer"),
        contentType: str(extra.contentType, "blog-post"),
        tone: str(extra.tone, "Professional"),
        audience: str(extra.audience, "General"),
        language,
        brandVoice: str(extra.brandVoice, ""),
        writingStyle: str(extra.writingStyle, "Standard"),
        creativityLevel: str(extra.creativityLevel, "Balanced"),
        options: strArr(extra.options, features),
        seoKeywords: str(extra.seoKeywords, ""),
      };
      return contentInputToBrief(input);
    }
    case "video-studio": {
      const input: VideoPluginInput = {
        prompt,
        videoType: str(extra.videoType, "promo"),
        style: str(extra.style, theme),
        aspectRatio: str(extra.aspectRatio, "16:9"),
        duration: str(extra.duration, "30s"),
        mood: str(extra.mood, "energetic"),
        cameraMove: str(extra.cameraMove, "dynamic"),
        options: strArr(extra.options, features),
        sceneCount: num(extra.sceneCount, 4),
      };
      return videoInputToBrief(input);
    }
    case "marketing-ai": {
      const input: PluginBriefInput = {
        prompt,
        language,
        theme,
        features,
      };
      return marketingInputToBrief(input);
    }
    default: {
      const _exhaustive: never = canonicalProductId;
      throw new Error(`Unsupported AI Core product: ${_exhaustive}`);
    }
  }
}
