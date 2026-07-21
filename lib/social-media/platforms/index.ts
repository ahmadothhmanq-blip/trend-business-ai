/**
 * Social platform adapters foundation (OAuth publishing not implemented).
 */

import type { SocialPlatform, SocialPostPlatform } from "@/types/social-media";

export type PlatformAdapter = {
  id: SocialPlatform;
  label: string;
  publishSupported: boolean;
  maxCaptionLength: number;
  hashtagLimit: number;
  supportsImages: boolean;
  supportsVideo: boolean;
  oauthReady: boolean;
};

export const PLATFORM_ADAPTERS: Record<SocialPlatform, PlatformAdapter> = {
  facebook: {
    id: "facebook",
    label: "Facebook",
    publishSupported: false,
    maxCaptionLength: 63206,
    hashtagLimit: 30,
    supportsImages: true,
    supportsVideo: true,
    oauthReady: false,
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    publishSupported: false,
    maxCaptionLength: 2200,
    hashtagLimit: 30,
    supportsImages: true,
    supportsVideo: true,
    oauthReady: false,
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp Business",
    publishSupported: false,
    maxCaptionLength: 4096,
    hashtagLimit: 0,
    supportsImages: true,
    supportsVideo: true,
    oauthReady: false,
  },
  messenger: {
    id: "messenger",
    label: "Messenger",
    publishSupported: false,
    maxCaptionLength: 2000,
    hashtagLimit: 0,
    supportsImages: true,
    supportsVideo: true,
    oauthReady: false,
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    publishSupported: false,
    maxCaptionLength: 3000,
    hashtagLimit: 5,
    supportsImages: true,
    supportsVideo: true,
    oauthReady: false,
  },
  x: {
    id: "x",
    label: "X (Twitter)",
    publishSupported: false,
    maxCaptionLength: 280,
    hashtagLimit: 10,
    supportsImages: true,
    supportsVideo: true,
    oauthReady: false,
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    publishSupported: false,
    maxCaptionLength: 2200,
    hashtagLimit: 20,
    supportsImages: false,
    supportsVideo: true,
    oauthReady: false,
  },
};

export const POST_PLATFORMS: SocialPostPlatform[] = [
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "tiktok",
];

export const SOCIAL_MEDIA_DIMENSIONS = [
  { id: "ig-square", label: "Instagram Square", platform: "instagram" as const, width: 1080, height: 1080 },
  { id: "ig-portrait", label: "Instagram Portrait", platform: "instagram" as const, width: 1080, height: 1350 },
  { id: "ig-story", label: "Instagram Story/Reel", platform: "instagram" as const, width: 1080, height: 1920 },
  { id: "fb-link", label: "Facebook Link Share", platform: "facebook" as const, width: 1200, height: 630 },
  { id: "li-post", label: "LinkedIn Post", platform: "linkedin" as const, width: 1200, height: 627 },
] as const;

export function getPlatformAdapter(platform: SocialPlatform): PlatformAdapter {
  return PLATFORM_ADAPTERS[platform];
}

export function validatePostForPlatform(
  platform: SocialPostPlatform,
  text: string,
  hashtagCount: number,
): { valid: boolean; issues: string[] } {
  const adapter = PLATFORM_ADAPTERS[platform];
  const issues: string[] = [];
  if (text.length > adapter.maxCaptionLength) {
    issues.push(`Text exceeds ${adapter.maxCaptionLength} character limit for ${adapter.label}.`);
  }
  if (hashtagCount > adapter.hashtagLimit && adapter.hashtagLimit > 0) {
    issues.push(`Too many hashtags (max ${adapter.hashtagLimit} for ${adapter.label}).`);
  }
  return { valid: issues.length === 0, issues };
}
