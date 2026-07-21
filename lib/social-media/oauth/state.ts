import { createHash, randomBytes } from "node:crypto";

const STATE_COOKIE = "social_oauth_state";
const PKCE_COOKIE = "social_oauth_pkce";

export function generateOAuthState(userId: string, platform: string): string {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${userId}:${platform}:${nonce}:${Date.now()}`;
  const sig = createHash("sha256").update(`${payload}:${process.env.SOCIAL_OAUTH_STATE_SECRET ?? "dev-state"}`).digest("hex").slice(0, 16);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyOAuthState(state: string): { userId: string; platform: string } | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length < 5) return null;
    const sig = parts.pop()!;
    const payload = parts.join(":");
    const expected = createHash("sha256").update(`${payload}:${process.env.SOCIAL_OAUTH_STATE_SECRET ?? "dev-state"}`).digest("hex").slice(0, 16);
    if (sig !== expected) return null;
    const [userId, platform] = parts;
    return { userId, platform };
  } catch {
    return null;
  }
}

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export { STATE_COOKIE, PKCE_COOKIE };
