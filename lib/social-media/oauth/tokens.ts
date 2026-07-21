import { encryptToken, decryptToken } from "@/lib/social-media/crypto";
import { getOAuthProvider, getOAuthCredentials, getRedirectUri } from "@/lib/social-media/oauth/providers";
import type { SupabaseClient } from "@supabase/supabase-js";

export type TokenBundle = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null;
  accountId: string;
  accountName: string;
};

export async function exchangeCodeForTokens(
  platform: string,
  code: string,
  codeVerifier?: string,
): Promise<TokenBundle> {
  const provider = getOAuthProvider(platform);
  if (!provider) throw new Error("Unknown platform.");

  const { clientId, clientSecret } = getOAuthCredentials(provider);
  if (!clientId || !clientSecret) {
    throw new Error(`${provider.label} OAuth is not configured. Set ${provider.clientIdEnv}.`);
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(platform),
    client_id: clientId,
    client_secret: clientSecret,
  });
  if (codeVerifier) body.set("code_verifier", codeVerifier);

  const res = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(String(data.error_description ?? data.error ?? "Token exchange failed"));
  }

  const accessToken = String(data.access_token ?? "");
  const refreshToken = String(data.refresh_token ?? "");
  const expiresIn = Number(data.expires_in ?? 0);
  const expiresAt = expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

  const profile = await fetchPlatformProfile(platform, accessToken);

  return {
    accessToken,
    refreshToken,
    expiresAt,
    accountId: profile.id,
    accountName: profile.name,
  };
}

async function fetchPlatformProfile(platform: string, accessToken: string) {
  if (platform === "linkedin") {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = (await res.json()) as { sub?: string; name?: string };
    return { id: data.sub ?? "linkedin-user", name: data.name ?? "LinkedIn Account" };
  }
  if (platform === "x") {
    const res = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = (await res.json()) as { data?: { id?: string; username?: string } };
    return { id: data.data?.id ?? "x-user", name: data.data?.username ?? "X Account" };
  }
  // Meta family (Facebook, Instagram, WhatsApp, Messenger)
  const res = await fetch(
    `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`,
  );
  const data = (await res.json()) as { id?: string; name?: string };
  return { id: data.id ?? `${platform}-user`, name: data.name ?? `${platform} Account` };
}

export async function refreshAccessToken(
  platform: string,
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; expiresAt: string | null }> {
  const provider = getOAuthProvider(platform);
  if (!provider) throw new Error("Unknown platform.");

  const { clientId, clientSecret } = getOAuthCredentials(provider);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) throw new Error(String(data.error_description ?? "Refresh failed"));

  const expiresIn = Number(data.expires_in ?? 0);
  return {
    accessToken: String(data.access_token ?? ""),
    refreshToken: String(data.refresh_token ?? refreshToken),
    expiresAt: expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
  };
}

export async function saveConnectedAccount(
  supabase: SupabaseClient,
  args: {
    userId: string;
    platform: string;
    tokens: TokenBundle;
    accountHandle?: string;
  },
) {
  const row = {
    user_id: args.userId,
    platform: args.platform,
    account_id: args.tokens.accountId,
    account_name: args.tokens.accountName,
    account_handle: args.accountHandle ?? args.tokens.accountName,
    status: "connected",
    connection_status: "connected",
    access_token_encrypted: encryptToken(args.tokens.accessToken),
    refresh_token_encrypted: encryptToken(args.tokens.refreshToken),
    encrypted_token: encryptToken(args.tokens.accessToken),
    expires_at: args.tokens.expiresAt,
    token_expires_at: args.tokens.expiresAt,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("user_id", args.userId)
    .eq("platform", args.platform)
    .eq("account_id", args.tokens.accountId)
    .maybeSingle();

  if (existing?.id) {
    return supabase.from("social_accounts").update(row).eq("id", existing.id).select("id, platform, account_name, account_handle, status, connection_status, expires_at, token_expires_at, metadata, created_at, updated_at").single();
  }

  return supabase.from("social_accounts").insert(row).select("id, platform, account_name, account_handle, status, connection_status, expires_at, token_expires_at, metadata, created_at, updated_at").single();
}

export async function getDecryptedTokens(account: {
  access_token_encrypted?: string;
  refresh_token_encrypted?: string;
  encrypted_token?: string;
}) {
  const access =
    account.access_token_encrypted
      ? decryptToken(account.access_token_encrypted)
      : account.encrypted_token
        ? decryptToken(account.encrypted_token)
        : "";
  const refresh = account.refresh_token_encrypted ? decryptToken(account.refresh_token_encrypted) : "";
  return { accessToken: access, refreshToken: refresh };
}
