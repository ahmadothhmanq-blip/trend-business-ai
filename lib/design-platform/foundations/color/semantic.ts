import { TBDP_COLOR_PRIMITIVES } from "@/lib/design-platform/foundations/color/primitives";
import type {
  TbdpColorMode,
  TbdpSemanticColorGroup,
  TbdpSemanticColorTokens,
} from "@/lib/design-platform/foundations/color/types";

const p = TBDP_COLOR_PRIMITIVES;

function rgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildLightSemanticColors(): TbdpSemanticColorGroup {
  return {
    primary: p.brand[600],
    secondary: p.neutral[700],
    accent: p.brand[400],
    success: p.success[500],
    warning: p.warning[500],
    danger: p.danger[500],
    info: p.info[500],
    surface: {
      base: p.neutral[0],
      raised: p.neutral[50],
      overlay: p.neutral[0],
      sunken: p.neutral[100],
      inverse: p.neutral[900],
    },
    background: {
      canvas: p.neutral[50],
      subtle: p.neutral[100],
      emphasis: p.neutral[0],
      inverse: p.neutral[950],
    },
    text: {
      primary: p.neutral[900],
      secondary: p.neutral[600],
      tertiary: p.neutral[500],
      disabled: p.neutral[400],
      inverse: p.neutral[0],
      link: p.brand[600],
      linkHover: p.brand[700],
    },
    border: {
      default: p.neutral[200],
      subtle: p.neutral[100],
      strong: p.neutral[300],
      focus: p.brand[500],
      inverse: rgba(p.neutral[0], 0.16),
    },
    overlay: {
      scrim: rgba(p.neutral[950], 0.4),
      scrimStrong: rgba(p.neutral[950], 0.64),
      backdrop: rgba(p.neutral[950], 0.24),
      highlight: rgba(p.brand[500], 0.12),
    },
  };
}

function buildDarkSemanticColors(): TbdpSemanticColorGroup {
  return {
    primary: p.brand[400],
    secondary: p.neutral[300],
    accent: p.brand[300],
    success: p.success[300],
    warning: p.warning[300],
    danger: p.danger[300],
    info: p.info[300],
    surface: {
      base: p.neutral[900],
      raised: p.neutral[800],
      overlay: p.neutral[800],
      sunken: p.neutral[950],
      inverse: p.neutral[0],
    },
    background: {
      canvas: p.neutral[950],
      subtle: p.neutral[900],
      emphasis: p.neutral[800],
      inverse: p.neutral[0],
    },
    text: {
      primary: p.neutral[50],
      secondary: p.neutral[300],
      tertiary: p.neutral[400],
      disabled: p.neutral[600],
      inverse: p.neutral[900],
      link: p.brand[300],
      linkHover: p.brand[200],
    },
    border: {
      default: p.neutral[700],
      subtle: p.neutral[800],
      strong: p.neutral[600],
      focus: p.brand[400],
      inverse: rgba(p.neutral[0], 0.12),
    },
    overlay: {
      scrim: rgba(p.neutral[950], 0.72),
      scrimStrong: rgba(p.neutral[950], 0.88),
      backdrop: rgba(p.neutral[950], 0.48),
      highlight: rgba(p.brand[400], 0.16),
    },
  };
}

/** Semantic color tokens for light and dark modes. */
export const TBDP_SEMANTIC_COLORS: TbdpSemanticColorTokens = {
  light: buildLightSemanticColors(),
  dark: buildDarkSemanticColors(),
};

export function resolveSemanticColors(mode: TbdpColorMode): TbdpSemanticColorGroup {
  return TBDP_SEMANTIC_COLORS[mode];
}
