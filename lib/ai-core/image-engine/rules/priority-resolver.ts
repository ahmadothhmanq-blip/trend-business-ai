import type { ResolveSlotImageInput, ResolvedSlotImage } from "@/lib/ai-core/image-engine/rules/types";

/**
 * Priority order: User Upload → AI Generated → Industry Image Library → Stock Images
 */
export function resolveSlotImageSource(input: ResolveSlotImageInput): ResolvedSlotImage | null {
  const tiers: Array<{ tier: ResolvedSlotImage["sourceTier"]; url?: string | null }> = [
    { tier: "user", url: input.userUrl },
    { tier: "ai", url: input.aiUrl },
    { tier: "library", url: input.libraryUrl },
    { tier: "stock", url: input.stockUrl },
  ];

  for (const { tier, url } of tiers) {
    if (url?.trim()) {
      return { url: url.trim(), sourceTier: tier };
    }
  }
  return null;
}

export function inferSourceTier(
  slot: {
    isUserOverride?: boolean;
    provider?: string;
    sourceTier?: ResolvedSlotImage["sourceTier"];
  },
): ResolvedSlotImage["sourceTier"] {
  if (slot.sourceTier) return slot.sourceTier;
  if (slot.isUserOverride) return "user";
  const provider = slot.provider?.toLowerCase() ?? "";
  if (provider.includes("openai") || provider.includes("ai") || provider.includes("dall")) {
    return "ai";
  }
  if (provider.includes("library") || provider.includes("profile")) {
    return "library";
  }
  return "stock";
}
