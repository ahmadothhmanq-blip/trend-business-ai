import { v } from "@/lib/design-platform/components/core";

/** ProductCard component tokens — references Phase 1 TBDP variables only. */
export const P_R_O_D_U_C_T_C_A_R_D_TOKENS = {
  color: v.color.text.primary,
  background: v.color.surface.base,
  border: v.color.border.default,
  radius: v.radius.md,
  padding: v.spacing.md,
  gap: v.spacing.sm,
  shadow: v.shadow["1"],
  font: v.font.body,
} as const;
