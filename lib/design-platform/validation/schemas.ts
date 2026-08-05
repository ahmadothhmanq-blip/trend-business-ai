import { z } from "zod";
import {
  TBDP_PACKAGE_ID,
  TBDP_PHASE,
  TBDP_SPEC_VERSION,
} from "@/lib/design-platform/constants";

const hexColor = z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/);
const rgbaColor = z.string().regex(/^rgba?\(/);
const cssLength = z.string().min(1);

const semanticColorGroupSchema = z.object({
  primary: z.union([hexColor, rgbaColor]),
  secondary: z.union([hexColor, rgbaColor]),
  accent: z.union([hexColor, rgbaColor]),
  success: z.union([hexColor, rgbaColor]),
  warning: z.union([hexColor, rgbaColor]),
  danger: z.union([hexColor, rgbaColor]),
  info: z.union([hexColor, rgbaColor]),
  surface: z.object({
    base: z.union([hexColor, rgbaColor]),
    raised: z.union([hexColor, rgbaColor]),
    overlay: z.union([hexColor, rgbaColor]),
    sunken: z.union([hexColor, rgbaColor]),
    inverse: z.union([hexColor, rgbaColor]),
  }),
  background: z.object({
    canvas: z.union([hexColor, rgbaColor]),
    subtle: z.union([hexColor, rgbaColor]),
    emphasis: z.union([hexColor, rgbaColor]),
    inverse: z.union([hexColor, rgbaColor]),
  }),
  text: z.object({
    primary: z.union([hexColor, rgbaColor]),
    secondary: z.union([hexColor, rgbaColor]),
    tertiary: z.union([hexColor, rgbaColor]),
    disabled: z.union([hexColor, rgbaColor]),
    inverse: z.union([hexColor, rgbaColor]),
    link: z.union([hexColor, rgbaColor]),
    linkHover: z.union([hexColor, rgbaColor]),
  }),
  border: z.object({
    default: z.union([hexColor, rgbaColor]),
    subtle: z.union([hexColor, rgbaColor]),
    strong: z.union([hexColor, rgbaColor]),
    focus: z.union([hexColor, rgbaColor]),
    inverse: z.union([hexColor, rgbaColor]),
  }),
  overlay: z.object({
    scrim: rgbaColor,
    scrimStrong: rgbaColor,
    backdrop: rgbaColor,
    highlight: rgbaColor,
  }),
});

export const tbdpDesignTokensSchema = z.object({
  meta: z.object({
    packageId: z.literal(TBDP_PACKAGE_ID),
    specVersion: z.literal(TBDP_SPEC_VERSION),
    phase: z.literal(TBDP_PHASE),
    generatedAt: z.string().min(1),
  }),
  mode: z.enum(["light", "dark"]),
  typographyProfile: z.enum(["latin-ltr", "latin-rtl", "arabic-rtl", "arabic-ltr"]),
  color: semanticColorGroupSchema,
  opacity: z.record(z.string(), z.number().min(0).max(1)),
  spacing: z.object({
    unit: cssLength,
    scale: z.record(z.string(), cssLength),
    semantic: z.object({
      component: z.record(z.string(), cssLength),
      layout: z.record(z.string(), cssLength),
      section: z.record(z.string(), cssLength),
    }),
  }),
  grid: z.object({
    breakpoints: z.record(
      z.string(),
      z.object({
        minWidth: cssLength,
        maxWidth: cssLength.optional(),
      }),
    ),
    containers: z.record(z.string(), cssLength),
    columns: z.record(z.string(), z.number().int().positive()),
    gutters: z.record(z.string(), cssLength),
    safeAreas: z.record(z.string(), cssLength),
    maxWidths: z.record(z.string(), cssLength),
  }),
  radius: z.record(z.string(), cssLength),
  shadow: z.record(z.string(), z.string()),
  border: z.object({
    width: z.record(z.string(), cssLength),
    style: z.record(z.string(), z.string()),
  }),
  divider: z.record(z.string(), z.string()),
  icon: z.object({
    size: z.record(z.string(), cssLength),
    spacing: z.record(z.string(), cssLength),
    stroke: z.record(z.string(), z.string()),
    usage: z.object({
      minContrastRatio: z.number().positive(),
      decorativeOpacity: z.number().min(0).max(1),
      interactivePadding: cssLength,
    }),
  }),
  elevation: z.object({
    layers: z.record(
      z.string(),
      z.object({
        zIndex: z.number().int(),
        shadow: z.string(),
      }),
    ),
    hierarchy: z.object({
      description: z.string(),
      order: z.array(z.string()),
    }),
  }),
  typography: z.object({
    profiles: z.record(z.string(), z.any()),
    fallbacks: z.record(z.string(), z.string()),
    responsive: z.record(z.string(), z.record(z.string(), cssLength)),
  }),
});
