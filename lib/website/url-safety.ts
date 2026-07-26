/**
 * SSRF-safe outbound URL validation for webhooks and integrations.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "metadata.google",
]);

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * Returns true when URL is safe for server-side fetch (HTTPS, public host).
 */
export function isSafeOutboundUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.has(host)) return false;
    if (host.endsWith(".local") || host.endsWith(".internal")) return false;
    if (isPrivateIpv4(host)) return false;
    if (host.startsWith("10.") || host.startsWith("192.168.")) return false;
    return true;
  } catch {
    return false;
  }
}

export function assertSafeOutboundUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || !isSafeOutboundUrl(trimmed)) return null;
  return trimmed;
}
