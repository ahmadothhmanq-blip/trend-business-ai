export type BasePalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
};

export type HarmonizedPalette = {
  colors: Record<string, string>;
  borders: Record<string, string>;
  shadows: Record<string, string>;
};

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb {
  const raw = hex.replace("#", "").trim();
  const value =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.slice(0, 6);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(a: Rgb, b: Rgb, ratio: number): Rgb {
  const t = Math.max(0, Math.min(1, ratio));
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function luminance({ r, g, b }: Rgb): number {
  const ch = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex: string, amount: number): string {
  return toHex(mix(parseHex(hex), { r: 255, g: 255, b: 255 }, amount));
}

function darken(hex: string, amount: number): string {
  return toHex(mix(parseHex(hex), { r: 0, g: 0, b: 0 }, amount));
}

export function isDarkPalette(background: string): boolean {
  return luminance(parseHex(background)) < 0.22;
}

function surfaceColor(base: BasePalette, dark: boolean): string {
  if (dark) {
    return toHex(mix(parseHex(base.background), parseHex(base.secondary), 0.55));
  }
  return "#FFFFFF";
}

function gridColor(base: BasePalette, dark: boolean): string {
  const source = dark ? base.accent : base.primary;
  return rgba(source, dark ? 0.08 : 0.05);
}

function buildShadows(base: BasePalette, dark: boolean, packageId?: string): Record<string, string> {
  const fg = parseHex(base.foreground);
  const accent = parseHex(base.accent);
  if (dark && packageId === "real-estate-prestige") {
    return {
      surface: "0 16px 48px rgba(0,0,0,0.48)",
      glow: `0 0 88px ${rgba(base.accent, 0.2)}, 0 0 24px ${rgba(base.accent, 0.08)}`,
      card: `0 0 0 1px ${rgba(base.accent, 0.14)}, 0 24px 56px rgba(0,0,0,0.42)`,
    };
  }
  if (dark && packageId === "hotel-resort-premium") {
    return {
      surface: "0 18px 52px rgba(0,0,0,0.38), 0 0 1px rgba(240,233,222,0.08)",
      glow: `0 0 72px ${rgba(base.accent, 0.16)}, 0 0 20px ${rgba(base.accent, 0.07)}`,
      card: `0 0 0 1px ${rgba(base.foreground, 0.09)}, 0 22px 56px rgba(0,0,0,0.32)`,
    };
  }
  if (dark) {
    return {
      surface: `0 12px 40px rgba(0,0,0,0.28)`,
      glow: `0 0 96px ${rgba(base.accent, 0.22)}`,
      card: `0 0 0 1px ${rgba(base.foreground, 0.08)}, 0 16px 48px rgba(0,0,0,0.32)`,
    };
  }
  return {
    surface: `0 20px 60px ${rgba(base.primary, 0.07)}, 0 2px 8px ${rgba(base.primary, 0.03)}`,
    glow: `0 0 64px ${rgba(base.accent, 0.18)}`,
    card: `0 0 0 1px ${rgba(base.primary, 0.05)}, 0 8px 32px ${rgba(base.primary, 0.06)}`,
  };
}

function buildBorders(base: BasePalette, dark: boolean, packageId?: string): Record<string, string> {
  if (dark && packageId === "real-estate-prestige") {
    return {
      default: rgba(base.accent, 0.16),
      accent: rgba(base.accent, 0.44),
      subtle: rgba(base.foreground, 0.06),
    };
  }
  if (dark) {
    return {
      default: rgba(base.foreground, 0.12),
      accent: rgba(base.accent, 0.38),
      subtle: rgba(base.foreground, 0.06),
    };
  }
  return {
    default: rgba(base.primary, 0.09),
    accent: rgba(base.accent, 0.32),
    subtle: rgba(base.primary, 0.05),
  };
}

const PACKAGE_COLOR_EXTRAS: Record<string, (base: BasePalette, core: Record<string, string>) => Record<string, string>> = {
  "creative-agency-premium": (base, core) => ({
    volt: base.accent,
    ghost: base.foreground,
    zinc: core.muted ? core.muted : rgba(base.foreground, 0.45),
  }),
  "creative-portfolio": (base, core) => ({
    volt: base.accent,
    magenta: "#FF2D6A",
    ghost: base.foreground,
    zinc: rgba(base.foreground, 0.45),
  }),
  "hotel-resort-premium": (base) => ({
    sand: base.foreground,
    azure: base.accent,
    "azure-light": lighten(base.accent, 0.14),
    "azure-deep": darken(base.accent, 0.14),
    pearl: toHex(mix(parseHex(base.background), parseHex(base.secondary), 0.4)),
    "surface-elevated": toHex(mix(parseHex(base.background), parseHex(base.secondary), 0.62)),
    "border-azure": rgba(base.accent, 0.32),
  }),
  "restaurant-premium": (base) => ({
    copper: lighten(base.accent, 0.12),
    ember: darken(base.accent, 0.18),
    linen: lighten(base.foreground, 0.02),
  }),
  "restaurant-signature": (base) => ({
    copper: lighten(base.accent, 0.12),
    ember: darken(base.accent, 0.18),
    linen: lighten(base.foreground, 0.02),
  }),
  "real-estate-premium": (base) => ({
    stone: rgba(base.primary, 0.12),
    brass: base.accent,
    linen: lighten(base.background, 0.03),
  }),
    "real-estate-prestige": (base) => ({
    stone: rgba(base.foreground, 0.1),
    brass: base.accent,
    "brass-light": lighten(base.accent, 0.1),
    "brass-deep": darken(base.accent, 0.22),
    linen: toHex(mix(parseHex(base.background), parseHex(base.accent), 0.05)),
    "surface-elevated": toHex(mix(parseHex(base.background), parseHex(base.accent), 0.12)),
    "surface-inset": toHex(mix(parseHex(base.background), parseHex("#000000"), 0.12)),
    muted: rgba(toHex(mix(parseHex(base.foreground), parseHex(base.accent), 0.08)), 0.62),
  }),
  "medical-premium": (base) => ({
    healing: toHex(mix(parseHex(base.accent), parseHex("#6B9B8A"), 0.45)),
    pearl: base.background,
    sage: toHex(mix(parseHex(base.background), parseHex(base.secondary), 0.25)),
  }),
  "ecommerce-premium": (base) => ({
    linen: lighten(base.background, 0.02),
    champagne: base.accent,
    ink: base.primary,
  }),
};

/** Derive cohesive semantic colors, borders, and shadows from six base tokens. */
export function harmonizePalette(
  base: BasePalette,
  packageId?: string,
): HarmonizedPalette {
  const dark = isDarkPalette(base.background);
  const mutedAlpha = dark ? 0.62 : 0.56;
  const core: Record<string, string> = {
    primary: base.primary,
    secondary: base.secondary,
    accent: base.accent,
    background: base.background,
    foreground: base.foreground,
    muted: rgba(base.foreground, mutedAlpha),
    surface: surfaceColor(base, dark),
    signal: base.accent,
    grid: gridColor(base, dark),
    ink: dark ? base.background : base.primary,
  };

  const extras = packageId ? PACKAGE_COLOR_EXTRAS[packageId]?.(base, core) ?? {} : {};

  return {
    colors: { ...core, ...extras },
    borders: buildBorders(base, dark, packageId),
    shadows: buildShadows(base, dark, packageId),
  };
}
