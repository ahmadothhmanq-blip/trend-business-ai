/**
 * Social Media AI post generation engine.
 */

import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { buildPostGenerationPrompt, buildPostActionPrompt } from "@/lib/social-media/prompts";
import { brandContextToPrompt } from "@/lib/social-media/brand-integration";
import type { SocialBrandContext } from "@/types/social-media";
import type {
  GeneratedSocialPost,
  SocialPostAction,
  SocialPostPlatform,
  SocialTone,
} from "@/types/social-media";

type GeneratePostInput = {
  platform: SocialPostPlatform;
  topic: string;
  tone: SocialTone;
  language?: string;
  audience?: string;
  brandContext?: SocialBrandContext | null;
  templateStructure?: string;
};

type ActionInput = {
  action: SocialPostAction;
  text: string;
  platform: SocialPostPlatform;
  tone?: string;
  targetLanguage?: string;
  instruction?: string;
};

function parseGeneratedPost(raw: string): GeneratedSocialPost {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;
  return {
    title: String(parsed.title ?? "Social Post"),
    postText: String(parsed.postText ?? parsed.post_text ?? ""),
    caption: String(parsed.caption ?? ""),
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map(String) : [],
    cta: String(parsed.cta ?? ""),
    contentAngle: String(parsed.contentAngle ?? parsed.content_angle ?? ""),
    recommendedPostTime: String(parsed.recommendedPostTime ?? parsed.recommended_post_time ?? ""),
  };
}

export async function generateSocialPost(input: GeneratePostInput): Promise<GeneratedSocialPost & { provider: string }> {
  const providerName = getDefaultTextProvider();
  const resolved = providerManager.resolve(providerName);
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error("No AI provider configured.");
  }

  const brandContext = input.brandContext ? brandContextToPrompt(input.brandContext) : undefined;
  const { system, prompt } = buildPostGenerationPrompt({
    platform: input.platform,
    topic: input.topic,
    tone: input.tone,
    language: input.language ?? "English",
    audience: input.audience,
    brandContext,
    templateStructure: input.templateStructure,
  });

  const raw = await providerManager.generateText({ prompt, system, temperature: 0.7 }, resolved);
  const post = parseGeneratedPost(raw);
  return { ...post, provider: resolved };
}

export async function runSocialPostAction(
  input: ActionInput,
  onChunk?: (chunk: string) => void,
): Promise<GeneratedSocialPost & { provider: string }> {
  const providerName = getDefaultTextProvider();
  const resolved = providerManager.resolve(providerName);
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error("No AI provider configured.");
  }

  const actionLabel: Record<SocialPostAction, string> = {
    rewrite: "Rewrite for clarity and platform fit",
    improve_engagement: "Improve engagement hooks and CTA",
    shorten: "Shorten while keeping impact",
    expand: "Expand with more detail and value",
    translate: `Translate to ${input.targetLanguage ?? "target language"}`,
    generate_variations: "Generate an alternative variation",
  };

  const { system, prompt } = buildPostActionPrompt({
    action: actionLabel[input.action],
    text: input.text,
    platform: input.platform,
    tone: input.tone,
    targetLanguage: input.targetLanguage,
    instruction: input.instruction,
  });

  let raw: string;
  if (onChunk && providerManager.getProvider(resolved).streamText) {
    raw = await providerManager.streamText({ prompt, system, temperature: 0.65, onChunk }, resolved);
  } else {
    raw = await providerManager.generateText({ prompt, system, temperature: 0.65 }, resolved);
  }

  const parsed = parseGeneratedPost(raw);
  return {
    ...parsed,
    title: parsed.title || "Social Post",
    recommendedPostTime: "",
    provider: resolved,
  };
}

export function generatedPostToRow(
  generated: GeneratedSocialPost,
  extras: {
    platform: SocialPostPlatform;
    tone: string;
    language: string;
    campaignId?: string | null;
    templateId?: string | null;
    brandIdentityId?: string | null;
  },
) {
  return {
    platform: extras.platform,
    title: generated.title,
    post_text: generated.postText,
    caption: generated.caption,
    hashtags: generated.hashtags,
    cta: generated.cta,
    content_angle: generated.contentAngle,
    recommended_post_time: generated.recommendedPostTime,
    tone: extras.tone,
    language: extras.language,
    campaign_id: extras.campaignId ?? null,
    template_id: extras.templateId ?? null,
    brand_identity_id: extras.brandIdentityId ?? null,
    status: "draft" as const,
  };
}
