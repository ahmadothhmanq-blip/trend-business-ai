import { v } from "@/lib/design-platform/components/core";

/** Notification component tokens — references Phase 1 TBDP variables only. */
export const N_O_T_I_F_I_C_A_T_I_O_N_TOKENS = {
  color: v.color.text.primary,
  background: v.color.surface.base,
  border: v.color.border.default,
  radius: v.radius.md,
  padding: v.spacing.md,
  gap: v.spacing.sm,
  shadow: v.shadow["1"],
  font: v.font.body,
} as const;
