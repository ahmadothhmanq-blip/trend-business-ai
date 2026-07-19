/**
 * Platform subdomain helpers: username.trendbusiness.ai
 */

function platformApexHost(): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  try {
    if (site) return new URL(site).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  return process.env.TBA_PUBLISH_APEX_HOST || "trendbusiness.ai";
}

export function getSitesHost(): string {
  return process.env.TBA_SITES_HOST || `sites.${platformApexHost()}`;
}

export function getCnameTarget(): string {
  return process.env.TBA_CNAME_TARGET || getSitesHost();
}

export function getARecordTarget(): string {
  return process.env.TBA_A_RECORD_TARGET || "76.76.21.21";
}

/**
 * Normalize a user handle for subdomain (a-z0-9, max 32).
 */
export function normalizeSubdomainHandle(raw?: string | null): string | null {
  if (!raw) return null;
  const handle = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return handle.length >= 2 ? handle : null;
}

export function buildSubdomainHostname(handle?: string | null): string | null {
  const h = normalizeSubdomainHandle(handle);
  if (!h) return null;
  return `${h}.${getSitesHost()}`;
}

export function buildSubdomainUrl(handle?: string | null): string | null {
  const host = buildSubdomainHostname(handle);
  if (!host) return null;
  const proto =
    process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https")
      ? "https"
      : "http";
  return `${proto}://${host}`;
}

/** Platform hosts that must never be treated as custom domains. */
export function listPlatformHosts(): Set<string> {
  const hosts = new Set<string>([
    "localhost",
    "127.0.0.1",
    platformApexHost(),
    `www.${platformApexHost()}`,
    getSitesHost(),
    getCnameTarget(),
  ]);
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (site) hosts.add(new URL(site).hostname.toLowerCase());
  } catch {
    /* ignore */
  }
  return hosts;
}

export function isPlatformHost(hostname: string): boolean {
  const h = hostname.toLowerCase().split(":")[0] || "";
  if (listPlatformHosts().has(h)) return true;
  if (h.endsWith(`.${getSitesHost()}`)) return true;
  if (h.endsWith(".vercel.app") || h.endsWith(".localhost")) return true;
  return false;
}
