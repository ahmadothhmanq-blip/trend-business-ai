import type {
  TbdpThemeMode,
  TbdpThemeResolution,
  TbdpThemeSource,
} from "@/lib/design-platform/integration/core/types";
import type { TbdpSectorId } from "@/lib/design-platform/sector-dna";
import { getSectorDna } from "@/lib/design-platform/sector-dna";

export type TbdpThemeResolverInput = {
  mode?: TbdpThemeMode;
  source?: TbdpThemeSource;
  sectorId?: TbdpSectorId;
  brandThemeId?: string;
  userThemeId?: string;
  systemPrefersDark?: boolean;
};

function resolveMode(
  mode: TbdpThemeMode,
  sectorPreference: "light" | "dark" | "auto",
  systemPrefersDark?: boolean,
): "light" | "dark" {
  const effective = mode === "auto" ? sectorPreference : mode;
  if (effective === "auto") {
    return systemPrefersDark ? "dark" : "light";
  }
  return effective;
}

/**
 * Future-ready theme resolver supporting brand, industry, user, and system themes.
 */
export function resolveTheme(input: TbdpThemeResolverInput = {}): TbdpThemeResolution {
  const sector = input.sectorId ? getSectorDna(input.sectorId) : undefined;
  const sectorMode = sector?.visual.colorStrategy.modePreference ?? "light";
  const mode = input.mode ?? sectorMode;
  const source = input.source ?? (input.brandThemeId ? "brand" : input.userThemeId ? "user" : input.sectorId ? "industry" : "system");

  return {
    mode,
    resolvedMode: resolveMode(mode, sectorMode, input.systemPrefersDark),
    source,
    industryThemeId: input.sectorId ? `industry-${input.sectorId}` : undefined,
    brandThemeId: input.brandThemeId,
    userThemeId: input.userThemeId,
  };
}
