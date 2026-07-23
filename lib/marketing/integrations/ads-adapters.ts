import type { AdsProviderAdapter } from "./providers";

export const GoogleAdsAdapter: AdsProviderAdapter = {
  provider: "google_ads",
  async validateAccount(accessToken) {
    if (!accessToken) return { valid: false, error: "Missing access token" };
    return { valid: true };
  },
  async createDraftCampaign(draft) {
    if (process.env.MARKETING_ADS_MOCK === "true") {
      return { ok: true, draftId: `mock-google-${Date.now()}` };
    }
    return { ok: false, error: "Google Ads publishing not configured. Draft saved locally." };
  },
};

export const MetaAdsAdapter: AdsProviderAdapter = {
  provider: "meta_ads",
  async validateAccount(accessToken) {
    if (!accessToken) return { valid: false, error: "Missing access token" };
    return { valid: true };
  },
  async createDraftCampaign(draft) {
    if (process.env.MARKETING_ADS_MOCK === "true") {
      return { ok: true, draftId: `mock-meta-${Date.now()}` };
    }
    return { ok: false, error: "Meta Ads publishing not configured. Draft saved locally." };
  },
};
