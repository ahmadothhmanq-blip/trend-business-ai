import type { PremiumColorHarmony } from "@/lib/ai-core/design-system/premium/types";

function clamp(n: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => clamp(v).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function mix(
  a: string,
  b: string,
  t: number,
): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  if (!A || !B) return a;
  return rgbToHex(
    A.r + (B.r - A.r) * t,
    A.g + (B.g - A.g) * t,
    A.b + (B.b - A.b) * t,
  );
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function onColor(bg: string): string {
  return luminance(bg) > 0.45 ? "#0A0A0A" : "#FAFAFA";
}

export type HarmonySeed = {
  primary: string;
  secondary?: string;
  accent?: string;
  background?: string;
  mode?: PremiumColorHarmony["mode"];
  dark?: boolean;
};

/**
 * Generate a harmonious premium palette from brand seeds.
 */
export function generateColorHarmony(seed: HarmonySeed): PremiumColorHarmony {
  const primary = seed.primary.startsWith("#") ? seed.primary : `#${seed.primary}`;
  const dark = seed.dark ?? luminance(primary) < 0.35;
  const mode = seed.mode ?? "complementary";

  const secondary =
    seed.secondary?.startsWith("#")
      ? seed.secondary
      : dark
        ? mix(primary, "#0B1220", 0.55)
        : mix(primary, "#0F172A", 0.35);

  const accent =
    seed.accent?.startsWith("#")
      ? seed.accent
      : mode === "analogous"
        ? mix(primary, "#F59E0B", 0.35)
        : mix(primary, "#22D3EE", 0.4);

  const background =
    seed.background?.startsWith("#")
      ? seed.background
      : dark
        ? "#0A0A0A"
        : "#FFFFFF";

  const surface = dark
    ? mix(background, "#FFFFFF", 0.08)
    : mix(background, secondary, 0.06);

  const foreground = onColor(background);
  const neutral = dark
    ? mix(foreground, background, 0.45)
    : mix(foreground, background, 0.4);
  const muted = dark
    ? mix(foreground, background, 0.55)
    : mix(foreground, background, 0.5);

  return {
    mode,
    primary,
    secondary,
    accent,
    neutral,
    surface,
    background,
    foreground,
    muted,
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    onPrimary: onColor(primary),
    harmonyNotes: `${mode} harmony · ${dark ? "dark" : "light"} stage · WCAG-aware on-colors`,
  };
}
