import type { SocialAccountPublic } from "@/types/social-media";

/** Columns safe to return from APIs — never includes token fields */
export const SAFE_ACCOUNT_SELECT =
  "id, user_id, platform, account_id, account_name, account_handle, status, connection_status, expires_at, token_expires_at, metadata, created_at, updated_at";

export function toPublicAccount(row: Record<string, unknown>): SocialAccountPublic {
  const {
    access_token_encrypted: _a,
    refresh_token_encrypted: _r,
    encrypted_token: _e,
    ...safe
  } = row;
  return {
    ...safe,
    status: (safe.status ?? safe.connection_status ?? "disconnected") as SocialAccountPublic["status"],
    account_id: String(safe.account_id ?? ""),
    expires_at: (safe.expires_at as string | null) ?? null,
  } as SocialAccountPublic;
}
