import type { SocialPlatform } from "@/types/social-media";

export type OAuthProviderConfig = {
  platform: SocialPlatform;
  label: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  usesPkce?: boolean;
};

export const OAUTH_PROVIDERS: Record<string, OAuthProviderConfig> = {
  facebook: {
    platform: "facebook",
    label: "Facebook",
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    clientIdEnv: "SOCIAL_FACEBOOK_CLIENT_ID",
    clientSecretEnv: "SOCIAL_FACEBOOK_CLIENT_SECRET",
  },
  instagram: {
    platform: "instagram",
    label: "Instagram",
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
    clientIdEnv: "SOCIAL_FACEBOOK_CLIENT_ID",
    clientSecretEnv: "SOCIAL_FACEBOOK_CLIENT_SECRET",
  },
  whatsapp: {
    platform: "whatsapp",
    label: "WhatsApp Business",
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["whatsapp_business_management", "whatsapp_business_messaging"],
    clientIdEnv: "SOCIAL_FACEBOOK_CLIENT_ID",
    clientSecretEnv: "SOCIAL_FACEBOOK_CLIENT_SECRET",
  },
  messenger: {
    platform: "messenger",
    label: "Messenger",
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["pages_messaging", "pages_manage_metadata", "pages_show_list"],
    clientIdEnv: "SOCIAL_FACEBOOK_CLIENT_ID",
    clientSecretEnv: "SOCIAL_FACEBOOK_CLIENT_SECRET",
  },
  linkedin: {
    platform: "linkedin",
    label: "LinkedIn",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["w_member_social", "openid", "profile"],
    clientIdEnv: "SOCIAL_LINKEDIN_CLIENT_ID",
    clientSecretEnv: "SOCIAL_LINKEDIN_CLIENT_SECRET",
  },
  x: {
    platform: "x",
    label: "X (Twitter)",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientIdEnv: "SOCIAL_X_CLIENT_ID",
    clientSecretEnv: "SOCIAL_X_CLIENT_SECRET",
    usesPkce: true,
  },
};

export const CONNECTABLE_PLATFORMS = Object.keys(OAUTH_PROVIDERS) as SocialPlatform[];

export function getOAuthProvider(platform: string): OAuthProviderConfig | null {
  return OAUTH_PROVIDERS[platform] ?? null;
}

export function getOAuthCredentials(provider: OAuthProviderConfig) {
  return {
    clientId: process.env[provider.clientIdEnv] ?? "",
    clientSecret: process.env[provider.clientSecretEnv] ?? "",
  };
}

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL?.startsWith("http")) return process.env.VERCEL_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getRedirectUri(platform: string): string {
  return `${getAppBaseUrl()}/api/social-media/accounts/callback/${platform}`;
}
