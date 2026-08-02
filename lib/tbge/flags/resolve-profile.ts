/**
 * TBGE generation profile — aligned with Website Builder profiles for future integration.
 */

export type TbgeGenerationProfile = "professional" | "fast" | "ultra";

export type TbgeProfileLimits = {
  maxLlmCalls: number;
  allowContentModelCall: boolean;
  allowCustomLogicCall: boolean;
};

const PROFILE_LIMITS: Record<TbgeGenerationProfile, TbgeProfileLimits> = {
  professional: {
    maxLlmCalls: 5,
    allowContentModelCall: true,
    allowCustomLogicCall: true,
  },
  fast: {
    maxLlmCalls: 3,
    allowContentModelCall: true,
    allowCustomLogicCall: false,
  },
  ultra: {
    maxLlmCalls: 2,
    allowContentModelCall: false,
    allowCustomLogicCall: false,
  },
};

export function resolveTbgeProfileLimits(
  profile: TbgeGenerationProfile = "professional",
): TbgeProfileLimits {
  return PROFILE_LIMITS[profile];
}
