/**
 * Self-hosted Next.js runtime URL registration for App Builder.
 * Platform does not npm-build customer apps (D-004) — users host the ZIP themselves
 * and register the HTTPS URL for stores / production tracking.
 */

import { isStoreSuitableProductionUrl } from "@/lib/webapp/store-publish";

export type RuntimeHostStatus = "registered" | "verified" | "unreachable";

export type RuntimeHostRecord = {
  url: string;
  status: RuntimeHostStatus;
  verifiedAt: string | null;
  message: string;
  updatedAt: string;
};

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
]);

function isPrivateIpv4(hostname: string): boolean {
  const m = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const parts = m.slice(1).map(Number);
  if (parts.some((n) => n > 255)) return true;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function assertSafeRuntimeHostUrl(raw: string): {
  ok: true;
  url: string;
} | {
  ok: false;
  message: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Production URL is required." };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, message: "Invalid URL." };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, message: "Production URL must use HTTPS." };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, message: "URL must not include credentials." };
  }
  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, message: "Local and internal hosts are not allowed." };
  }
  if (isPrivateIpv4(host)) {
    return { ok: false, message: "Private IP addresses are not allowed." };
  }
  if (/\/w\/app\//i.test(parsed.pathname)) {
    return {
      ok: false,
      message:
        "Platform /w/app preview hosts are not a full Next.js runtime. Host the ZIP on your own HTTPS domain.",
    };
  }
  if (!isStoreSuitableProductionUrl(parsed.toString())) {
    return { ok: false, message: "URL is not suitable as a store/production host." };
  }
  // Normalize: drop hash, keep pathname
  parsed.hash = "";
  return { ok: true, url: parsed.toString().replace(/\/$/, "") || parsed.origin };
}

/**
 * Best-effort reachability probe with SSRF guards.
 * Does not claim the app is a valid Next.js deploy — only that HTTPS responds.
 */
export async function probeRuntimeHostUrl(
  raw: string,
  options?: { timeoutMs?: number; fetchImpl?: typeof fetch },
): Promise<{ ok: boolean; statusCode?: number; message: string }> {
  const safe = assertSafeRuntimeHostUrl(raw);
  if (!safe.ok) return { ok: false, message: safe.message };

  const timeoutMs = options?.timeoutMs ?? 8000;
  const fetchImpl = options?.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(safe.url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { Accept: "text/html,application/json,*/*" },
    });
    // Accept 2xx/3xx as reachable. Reject open redirects to opaque targets by not following.
    if (res.status >= 200 && res.status < 400) {
      return {
        ok: true,
        statusCode: res.status,
        message: `Host reachable (HTTP ${res.status}). Confirm /login and /api routes work on this URL.`,
      };
    }
    return {
      ok: false,
      statusCode: res.status,
      message: `Host responded with HTTP ${res.status}.`,
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      message: aborted
        ? "Host probe timed out."
        : "Unable to reach host. Check DNS, HTTPS, and firewall.",
    };
  } finally {
    clearTimeout(timer);
  }
}

export function registerRuntimeHost(params: {
  url: string;
  probe: { ok: boolean; statusCode?: number; message: string };
}): RuntimeHostRecord {
  const now = new Date().toISOString();
  const safe = assertSafeRuntimeHostUrl(params.url);
  if (!safe.ok) {
    throw new Error(safe.message);
  }
  return {
    url: safe.url,
    status: params.probe.ok ? "verified" : "unreachable",
    verifiedAt: params.probe.ok ? now : null,
    message: params.probe.message,
    updatedAt: now,
  };
}
