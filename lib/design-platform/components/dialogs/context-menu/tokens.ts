import { v } from "@/lib/design-platform/components/core";

/** ContextMenu component tokens — references Phase 1 TBDP variables only. */
export const C_O_N_T_E_X_T_M_E_N_U_TOKENS = {
  color: v.color.text.primary,
  background: v.color.surface.base,
  border: v.color.border.default,
  radius: v.radius.md,
  padding: v.spacing.md,
  gap: v.spacing.sm,
  shadow: v.shadow["1"],
  font: v.font.body,
} as const;
