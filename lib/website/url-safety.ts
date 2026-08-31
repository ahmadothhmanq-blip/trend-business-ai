/**
 * SSRF-safe outbound URL validation for webhooks, remote media, and integrations.
 * Hostname checks alone are not enough — resolved IPs are also inspected.
 */

import { lookup } from "node:dns/promises";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "metadata.google",
  "metadata",
  "instance-data",
]);

export type DnsLookupFn = (
  hostname: string,
  options: { all: true },
) => Promise<Array<{ address: string; family: number }>>;

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isMetadataIpv4(host: string): boolean {
  return host === "169.254.169.254" || host === "169.254.170.2" || host === "169.254.169.123";
}

export function isBlockedResolvedAddress(address: string): boolean {
  const host = address.trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return true;
  if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
  if (host.startsWith("fe80:")) return true;
  if (host.startsWith("fc") || host.startsWith("fd")) return true;
  if (host.startsWith("::ffff:")) {
    const v4 = host.slice("::ffff:".length);
    return isPrivateIpv4(v4) || isMetadataIpv4(v4);
  }
  if (isMetadataIpv4(host) || isPrivateIpv4(host)) return true;
  return false;
}

function hostnameLooksInternal(host: string): boolean {
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }
  if (host.includes("metadata.google")) return true;
  return false;
}

/**
 * Returns true when URL is safe for server-side fetch (HTTPS, public host).
 * Does not perform DNS — use assertSafeRemoteFetchUrl before fetching.
 */
export function isSafeOutboundUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (!host) return false;
    if (hostnameLooksInternal(host)) return false;
    if (isBlockedResolvedAddress(host)) return false;
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

export class UnsafeRemoteUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeRemoteUrlError";
  }
}

/**
 * Fail-closed SSRF guard: HTTPS only, blocked hosts, private/metadata IPs, and DNS resolution.
 */
export async function assertSafeRemoteFetchUrl(
  raw: string,
  lookupFn: DnsLookupFn = (hostname, options) => lookup(hostname, options),
): Promise<string> {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new UnsafeRemoteUrlError("URL is required.");
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new UnsafeRemoteUrlError("Invalid URL.");
  }

  if (url.protocol !== "https:") {
    throw new UnsafeRemoteUrlError("Only HTTPS remote URLs are allowed.");
  }
  if (url.username || url.password) {
    throw new UnsafeRemoteUrlError("URLs with credentials are not allowed.");
  }

  const host = url.hostname.toLowerCase();
  if (!host || hostnameLooksInternal(host) || isBlockedResolvedAddress(host)) {
    throw new UnsafeRemoteUrlError("Remote host is not allowed.");
  }

  let records: Array<{ address: string; family: number }>;
  try {
    records = await lookupFn(host, { all: true });
  } catch {
    throw new UnsafeRemoteUrlError("Could not resolve host for remote fetch.");
  }

  if (!records.length) {
    throw new UnsafeRemoteUrlError("Could not resolve host for remote fetch.");
  }

  for (const record of records) {
    if (isBlockedResolvedAddress(record.address)) {
      throw new UnsafeRemoteUrlError("Remote host resolved to a private or metadata address.");
    }
  }

  return trimmed;
}
