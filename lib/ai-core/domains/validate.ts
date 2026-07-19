/**
 * Domain hostname validation & normalization.
 */

const HOSTNAME_RE =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

const BLOCKED = new Set([
  "localhost",
  "example.com",
  "example.org",
  "test.com",
  "invalid",
]);

export function normalizeHostname(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "")
    .split(":")[0]!;
}

export function validateCustomHostname(raw: string): {
  ok: true;
  hostname: string;
} | {
  ok: false;
  error: string;
} {
  const hostname = normalizeHostname(raw);
  if (!hostname) {
    return { ok: false, error: "Domain is required." };
  }
  if (hostname.includes(" ") || hostname.includes("_")) {
    return { ok: false, error: "Domain contains invalid characters." };
  }
  if (!HOSTNAME_RE.test(hostname)) {
    return {
      ok: false,
      error: "Enter a valid domain like www.customer.com or customer.com.",
    };
  }
  if (BLOCKED.has(hostname) || hostname.endsWith(".local")) {
    return { ok: false, error: "This domain cannot be connected." };
  }
  const labels = hostname.split(".");
  if (labels.some((l) => l.length > 63)) {
    return { ok: false, error: "Domain label too long." };
  }
  return { ok: true, hostname };
}
