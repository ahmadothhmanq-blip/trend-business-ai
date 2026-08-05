import { buildTbdpDesignTokens } from "@/lib/design-platform/tokens";
import { buildTbdpExperience } from "@/lib/design-platform/experience";
import type { TbdpSectorDnaProfile } from "@/lib/design-platform/sector-dna/core/types";
import { getSectorDna } from "@/lib/design-platform/sector-dna/sectors";

export type TbdpResolvedSectorDna = {
  sector: TbdpSectorDnaProfile;
  foundations: ReturnType<typeof buildTbdpDesignTokens>;
  experience: ReturnType<typeof buildTbdpExperience>;
};

export type ResolveSectorDnaOptions = {
  direction?: "ltr" | "rtl";
  prefersReducedMotion?: boolean;
};

/**
 * Resolves a sector DNA profile into Phase 1–3 TBDP configurations.
 * Does not wire into website builder or templates.
 */
export function resolveSectorDna(
  sectorId: TbdpSectorDnaProfile["id"],
  options: ResolveSectorDnaOptions = {},
): TbdpResolvedSectorDna {
  const sector = getSectorDna(sectorId);
  if (!sector) {
    throw new Error(`Unknown sector DNA: ${sectorId}`);
  }

  const direction = options.direction ?? "ltr";
  const reducedMotion =
    options.prefersReducedMotion ??
    sector.experience.accessibilityProfile.motionSensitivity === "high";

  const typographyProfile =
    direction === "rtl" && sector.ai.typographyProfiles.includes("arabic-rtl")
      ? "arabic-rtl"
      : direction === "rtl" && sector.ai.typographyProfiles.includes("latin-rtl")
        ? "latin-rtl"
        : "latin-ltr";

  const foundations = buildTbdpDesignTokens({
    mode: sector.visual.colorStrategy.modePreference === "dark" ? "dark" : "light",
    typographyProfile,
  });

  const experience = buildTbdpExperience({
    direction,
    prefersReducedMotion: reducedMotion,
  });

  return { sector, foundations, experience };
}
