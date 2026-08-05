import type { TbdpColorPrimitives } from "@/lib/design-platform/foundations/color/types";

/**
 * Raw color primitives — the ONLY layer that may contain literal hex/rgba values.
 * Semantic tokens must reference these via the resolver, never duplicate literals.
 */
export const TBDP_COLOR_PRIMITIVES: TbdpColorPrimitives = {
  brand: {
    50: "#EEF4FF",
    100: "#D9E6FF",
    200: "#B3CCFF",
    300: "#85ADFF",
    400: "#4D85FF",
    500: "#1A5CFF",
    600: "#0047E6",
    700: "#0038B8",
    800: "#002A8A",
    900: "#001D5C",
    950: "#001242",
  },
  neutral: {
    0: "#FFFFFF",
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
    950: "#020617",
  },
  success: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    300: "#6EE7B7",
    500: "#10B981",
    700: "#047857",
    900: "#064E3B",
  },
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    300: "#FCD34D",
    500: "#F59E0B",
    700: "#B45309",
    900: "#78350F",
  },
  danger: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    300: "#FCA5A5",
    500: "#EF4444",
    700: "#B91C1C",
    900: "#7F1D1D",
  },
  info: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    300: "#93C5FD",
    500: "#3B82F6",
    700: "#1D4ED8",
    900: "#1E3A8A",
  },
};
