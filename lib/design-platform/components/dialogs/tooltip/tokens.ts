import { v } from "@/lib/design-platform/components/core";

/** Tooltip component tokens — references Phase 1 TBDP variables only. */
export const T_O_O_L_T_I_P_TOKENS = {
  color: v.color.text.primary,
  background: v.color.surface.base,
  border: v.color.border.default,
  radius: v.radius.md,
  padding: v.spacing.md,
  gap: v.spacing.sm,
  shadow: v.shadow["1"],
  font: v.font.body,
} as const;
