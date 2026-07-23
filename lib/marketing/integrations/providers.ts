/**
 * Integration providers — OAuth adapter structure & token security design.
 */

export type MarketingIntegrationProvider =
  | "google_ads"
  | "meta_ads"
  | "sendgrid"
  | "mailchimp"
  | "google_analytics";

export type IntegrationProviderConfig = {
  provider: MarketingIntegrationProvider;
  label: string;
  authType: "oauth2" | "api_key";
  clientIdEnv?: string;
  clientSecretEnv?: string;
  apiKeyEnv?: string;
  scopes: string[];
  authUrl?: string;
  tokenUrl?: string;
};

export const INTEGRATION_PROVIDERS: Record<MarketingIntegrationProvider, IntegrationProviderConfig> = {
  google_ads: {
    provider: "google_ads",
    label: "Google Ads",
    authType: "oauth2",
    clientIdEnv: "MARKETING_GOOGLE_ADS_CLIENT_ID",
    clientSecretEnv: "MARKETING_GOOGLE_ADS_CLIENT_SECRET",
    scopes: ["https://www.googleapis.com/auth/adwords"],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
  },
  meta_ads: {
    provider: "meta_ads",
    label: "Meta Ads",
    authType: "oauth2",
    clientIdEnv: "MARKETING_META_ADS_CLIENT_ID",
    clientSecretEnv: "MARKETING_META_ADS_CLIENT_SECRET",
    scopes: ["ads_management", "ads_read", "business_management"],
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
  },
  sendgrid: {
    provider: "sendgrid",
    label: "SendGrid",
    authType: "api_key",
    apiKeyEnv: "MARKETING_SENDGRID_API_KEY",
    scopes: [],
  },
  mailchimp: {
    provider: "mailchimp",
    label: "Mailchimp",
    authType: "oauth2",
    clientIdEnv: "MARKETING_MAILCHIMP_CLIENT_ID",
    clientSecretEnv: "MARKETING_MAILCHIMP_CLIENT_SECRET",
    scopes: [],
    authUrl: "https://login.mailchimp.com/oauth2/authorize",
    tokenUrl: "https://login.mailchimp.com/oauth2/token",
  },
  google_analytics: {
    provider: "google_analytics",
    label: "Google Analytics",
    authType: "oauth2",
    clientIdEnv: "MARKETING_GA_CLIENT_ID",
    clientSecretEnv: "MARKETING_GA_CLIENT_SECRET",
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
  },
};

/** Safe columns — never expose encrypted tokens in API responses */
export const SAFE_INTEGRATION_SELECT =
  "id, user_id, provider, status, account_name, expires_at, metadata, created_at, updated_at";

export interface EmailProviderAdapter {
  provider: "sendgrid" | "mailchimp";
  validateConfig(): { valid: boolean; error?: string };
  sendEmail(args: { to: string; subject: string; html: string; text?: string }): Promise<{ ok: boolean; messageId?: string; error?: string }>;
}

export interface AdsProviderAdapter {
  provider: "google_ads" | "meta_ads";
  validateAccount(accessToken: string): Promise<{ valid: boolean; error?: string }>;
  createDraftCampaign(draft: Record<string, unknown>): Promise<{ ok: boolean; draftId?: string; error?: string }>;
}

export function getIntegrationProvider(provider: string): IntegrationProviderConfig | null {
  return INTEGRATION_PROVIDERS[provider as MarketingIntegrationProvider] ?? null;
}
