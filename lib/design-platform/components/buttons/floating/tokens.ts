import { v } from "@/lib/design-platform/components/core";

/** FloatingButton component tokens — references Phase 1 TBDP variables only. */
export const F_L_O_A_T_I_N_G_B_U_T_T_O_N_TOKENS = {
  color: v.color.text.primary,
  background: v.color.surface.base,
  border: v.color.border.default,
  radius: v.radius.md,
  padding: v.spacing.md,
  gap: v.spacing.sm,
  shadow: v.shadow["1"],
  font: v.font.body,
} as const;
