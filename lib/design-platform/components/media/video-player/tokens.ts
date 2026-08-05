import { v } from "@/lib/design-platform/components/core";

/** VideoPlayer component tokens — references Phase 1 TBDP variables only. */
export const V_I_D_E_O_P_L_A_Y_E_R_TOKENS = {
  color: v.color.text.primary,
  background: v.color.surface.base,
  border: v.color.border.default,
  radius: v.radius.md,
  padding: v.spacing.md,
  gap: v.spacing.sm,
  shadow: v.shadow["1"],
  font: v.font.body,
} as const;
