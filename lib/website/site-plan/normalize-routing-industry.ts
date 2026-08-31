import { resolveStockIndustryId } from "@/lib/ai-core/image-engine/stock";

const GENERIC_INDUSTRY_RE =
  /\b(business|general[\s-]?business|company|corporate|office|enterprise|startup)\b/i;

/**
 * Normalize an explicit industry id/label to a stock routing id.
 * Returns null when the value is empty or too generic to trust over text detection.
 */
export function normalizeExplicitRoutingIndustryId(
  raw?: string | null,
): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const resolved = resolveStockIndustryId(value, value);
  if (resolved !== "business") return resolved;
  if (GENERIC_INDUSTRY_RE.test(value)) return "business";
  return null;
}

/** Pick the first trustworthy explicit industry signal. */
export function pickExplicitRoutingIndustryId(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    const resolved = normalizeExplicitRoutingIndustryId(candidate);
    if (resolved) return resolved;
  }
  return null;
}
