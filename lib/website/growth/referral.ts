/**
 * Referral + share hooks for published websites (Phase 8).
 */

export type ReferralSharePayload = {
  shareUrl: string;
  referralUrl: string;
  referralCode: string;
  twitterIntentUrl: string;
  linkedInShareUrl: string;
};

export function buildReferralCode(userId: string, generationId: string): string {
  const raw = `${userId.slice(0, 8)}-${generationId.slice(0, 8)}`;
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export function buildReferralSharePayload(params: {
  publicUrl: string;
  userId: string;
  generationId: string;
  title?: string;
}): ReferralSharePayload {
  const shareUrl = params.publicUrl.replace(/\/$/, "");
  const referralCode = buildReferralCode(params.userId, params.generationId);
  const referralUrl = `${shareUrl}?ref=${encodeURIComponent(referralCode)}`;
  const title = params.title?.trim() || "Check out this website";
  const text = encodeURIComponent(`${title} — built with Trend Business AI`);

  return {
    shareUrl,
    referralUrl,
    referralCode,
    twitterIntentUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralUrl)}&text=${text}`,
    linkedInShareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
  };
}
