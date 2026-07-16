/** Shared helpers for Growth Engine codes and scoring. */

export function slugifyCode(input: string, fallback = "user"): string {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16);
  return cleaned || fallback;
}

export function makeAffiliateCode(userId: string, email?: string | null): string {
  const base = slugifyCode(email?.split("@")[0] ?? "aff", "aff");
  const suffix = userId.replace(/-/g, "").slice(0, 6);
  return `${base}${suffix}`.slice(0, 24);
}

export function makeReferralCode(userId: string): string {
  const suffix = userId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `REF${suffix}`;
}

export function scoreLead(input: {
  email: string;
  name?: string | null;
  company?: string | null;
  phone?: string | null;
  message?: string | null;
  source?: string;
}): number {
  let score = 20;
  if (input.name?.trim()) score += 10;
  if (input.company?.trim()) score += 15;
  if (input.phone?.trim()) score += 10;
  if ((input.message?.trim().length ?? 0) > 40) score += 15;
  if (input.source === "contact") score += 10;
  if (input.source === "exit_intent") score += 5;
  if (input.email.includes("+")) score -= 5;
  const domain = input.email.split("@")[1]?.toLowerCase() ?? "";
  if (["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"].includes(domain)) {
    score -= 5;
  } else if (domain) {
    score += 10;
  }
  return Math.max(0, Math.min(100, score));
}

export function referralLink(origin: string, code: string): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}/signup?ref=${encodeURIComponent(code)}`;
}

export function affiliateLink(origin: string, code: string, path = "/"): string {
  const base = origin.replace(/\/+$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const joiner = normalized.includes("?") ? "&" : "?";
  return `${base}${normalized}${joiner}aff=${encodeURIComponent(code)}`;
}
