import type { TbdpSectorDnaProfile } from "@/lib/design-platform/sector-dna/core/types";

/** Shared AI defaults merged into each sector profile. */
export function defineSectorDna(
  profile: TbdpSectorDnaProfile,
): TbdpSectorDnaProfile {
  return {
    ...profile,
    ai: {
      ...profile.ai,
      confidence: profile.ai.confidence ?? 0.92,
    },
  };
}
