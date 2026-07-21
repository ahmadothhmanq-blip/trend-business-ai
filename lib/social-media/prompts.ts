/**
 * Social Media AI prompts.
 */

import type { SocialPostPlatform, SocialTone } from "@/types/social-media";

const PLATFORM_GUIDANCE: Record<SocialPostPlatform, string> = {
  facebook: "Facebook: conversational, community-focused, 1-3 short paragraphs, optional emoji, clear CTA.",
  instagram: "Instagram: visual-first caption, hook in first line, line breaks, 5-15 relevant hashtags at end.",
  linkedin: "LinkedIn: professional thought leadership, value-first, short paragraphs, minimal hashtags (3-5).",
  x: "X: punchy, under 280 chars for main post, hook-first, 1-2 hashtags max.",
  tiktok: "TikTok: trendy, hook-driven, casual voice, trending hashtag suggestions, video caption style.",
};

export function buildPostGenerationPrompt(args: {
  platform: SocialPostPlatform;
  topic: string;
  tone: SocialTone;
  language: string;
  audience?: string;
  brandContext?: string;
  templateStructure?: string;
}): { system: string; prompt: string } {
  const system = [
    "You are an expert social media copywriter for Trend Business AI Social Media Manager.",
    "Return ONLY valid JSON with keys: title, postText, caption, hashtags (array), cta, contentAngle, recommendedPostTime.",
    `Platform: ${args.platform}. ${PLATFORM_GUIDANCE[args.platform]}`,
    `Tone: ${args.tone}. Language: ${args.language}.`,
    args.audience ? `Audience: ${args.audience}` : "",
    args.brandContext ? `Brand guidelines:\n${args.brandContext}` : "",
    "recommendedPostTime should be a human-readable suggestion like 'Tuesday 10:00 AM' or 'Weekday evenings'.",
    "Do not include markdown fences or commentary.",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = args.templateStructure
    ? `Topic: ${args.topic}\n\nTemplate structure:\n${args.templateStructure}`
    : `Create a complete social post about: ${args.topic}`;

  return { system, prompt };
}

export function buildPostActionPrompt(args: {
  action: string;
  text: string;
  platform: SocialPostPlatform;
  tone?: string;
  targetLanguage?: string;
  instruction?: string;
}): { system: string; prompt: string } {
  const system = [
    "You are a social media editor. Return ONLY valid JSON with keys: postText, caption, hashtags (array), cta, contentAngle.",
    `Platform: ${args.platform}. ${PLATFORM_GUIDANCE[args.platform]}`,
    `Action: ${args.action}`,
    args.tone ? `Tone: ${args.tone}` : "",
    args.targetLanguage ? `Target language: ${args.targetLanguage}` : "",
    args.instruction ? `Instruction: ${args.instruction}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    system,
    prompt: `Edit this social post:\n\n${args.text}`,
  };
}

export const SOCIAL_TONES = [
  "Professional",
  "Casual",
  "Luxury",
  "Marketing",
  "Friendly",
  "Technical",
] as const satisfies readonly SocialTone[];
