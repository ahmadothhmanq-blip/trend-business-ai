import { TBDP_FONT_FALLBACKS } from "@/lib/design-platform/foundations/typography/fallbacks";
import type {
  TbdpTypographyProfile,
  TbdpTypographyProfileId,
  TbdpTypographyTokens,
} from "@/lib/design-platform/foundations/typography/types";

function profile(
  id: TbdpTypographyProfileId,
  direction: "ltr" | "rtl",
  localeFamily: "latin" | "arabic",
  displayFamily: string,
  bodyFamily: string,
): TbdpTypographyProfile {
  const rtlLetterSpacing = direction === "rtl" ? "0.01em" : "-0.02em";
  return {
    id,
    direction,
    localeFamily,
    display: {
      fontFamily: displayFamily,
      fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
      lineHeight: 1.05,
      fontWeight: 700,
      letterSpacing: rtlLetterSpacing,
    },
    headline: {
      fontFamily: displayFamily,
      fontSize: "clamp(1.75rem, 4vw, 3rem)",
      lineHeight: 1.1,
      fontWeight: 600,
      letterSpacing: rtlLetterSpacing,
    },
    title: {
      fontFamily: displayFamily,
      fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
      lineHeight: 1.2,
      fontWeight: 600,
      letterSpacing: direction === "rtl" ? "0" : "-0.01em",
    },
    body: {
      fontFamily: bodyFamily,
      fontSize: "1rem",
      lineHeight: 1.6,
      fontWeight: 400,
      letterSpacing: "0",
    },
    label: {
      fontFamily: bodyFamily,
      fontSize: "0.875rem",
      lineHeight: 1.4,
      fontWeight: 500,
      letterSpacing: direction === "rtl" ? "0.02em" : "0.01em",
    },
    caption: {
      fontFamily: bodyFamily,
      fontSize: "0.75rem",
      lineHeight: 1.35,
      fontWeight: 400,
      letterSpacing: "0.02em",
    },
  };
}

export const TBDP_TYPOGRAPHY_TOKENS: TbdpTypographyTokens = {
  profiles: {
    "latin-ltr": profile(
      "latin-ltr",
      "ltr",
      "latin",
      TBDP_FONT_FALLBACKS.displayLatin,
      TBDP_FONT_FALLBACKS.latin,
    ),
    "latin-rtl": profile(
      "latin-rtl",
      "rtl",
      "latin",
      TBDP_FONT_FALLBACKS.displayLatin,
      TBDP_FONT_FALLBACKS.latin,
    ),
    "arabic-rtl": profile(
      "arabic-rtl",
      "rtl",
      "arabic",
      TBDP_FONT_FALLBACKS.displayArabic,
      TBDP_FONT_FALLBACKS.arabic,
    ),
    "arabic-ltr": profile(
      "arabic-ltr",
      "ltr",
      "arabic",
      TBDP_FONT_FALLBACKS.displayArabic,
      TBDP_FONT_FALLBACKS.arabic,
    ),
  },
  fallbacks: {
    latin: TBDP_FONT_FALLBACKS.latin,
    arabic: TBDP_FONT_FALLBACKS.arabic,
    mono: TBDP_FONT_FALLBACKS.mono,
  },
  responsive: {
    display: {
      sm: "clamp(2rem, 8vw, 2.75rem)",
      md: "clamp(2.5rem, 6vw, 3.5rem)",
      lg: "clamp(3rem, 5vw, 4.5rem)",
    },
    headline: {
      sm: "clamp(1.5rem, 5vw, 2rem)",
      md: "clamp(1.75rem, 4vw, 2.5rem)",
      lg: "clamp(2rem, 3.5vw, 3rem)",
    },
    title: {
      sm: "1.125rem",
      md: "1.25rem",
      lg: "1.5rem",
    },
    body: {
      sm: "0.9375rem",
      md: "1rem",
      lg: "1.0625rem",
    },
    label: {
      sm: "0.8125rem",
      md: "0.875rem",
      lg: "0.875rem",
    },
    caption: {
      sm: "0.6875rem",
      md: "0.75rem",
      lg: "0.75rem",
    },
  },
};

export function resolveTypographyProfile(
  profileId: TbdpTypographyProfileId,
): TbdpTypographyProfile {
  return TBDP_TYPOGRAPHY_TOKENS.profiles[profileId];
}
