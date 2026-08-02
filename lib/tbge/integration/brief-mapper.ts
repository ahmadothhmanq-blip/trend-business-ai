/**
 * Map Website Builder input → TBGE brief + profile.
 */

import { WEBSITE_BUILDER_PRODUCT_ID } from "@/lib/ai-core/adapters/website-builder";
import { resolveWebsiteGenerationProfile } from "@/lib/website/generation-flags";
import type { TbgeBrief } from "@/lib/tbge/kernel/types";
import type { TbgeGenerationProfile, TbgeRunMode } from "@/lib/tbge/spec/types";
import type { WebsiteGenerationInput } from "@/lib/website/types";

export function mapWebsiteInputToTbgeBrief(input: WebsiteGenerationInput): TbgeBrief {
  return {
    prompt: input.prompt,
    productId: WEBSITE_BUILDER_PRODUCT_ID,
    language: input.language,
    theme: input.theme,
    features: input.features,
    metadata: {
      projectType: input.projectType,
      projectKind: input.projectKind,
      templateId: input.templateId,
      industryId: input.industryId,
    },
  };
}

export function mapWebsiteProfileToTbge(
  input: WebsiteGenerationInput,
): TbgeGenerationProfile {
  return resolveWebsiteGenerationProfile(input);
}

export function mapWebsiteModeToTbge(
  mode?: WebsiteGenerationInput["mode"],
): TbgeRunMode {
  return mode ?? "generate";
}
