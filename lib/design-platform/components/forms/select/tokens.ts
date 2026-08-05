import { v } from "@/lib/design-platform/components/core";

/** Select component tokens — references Phase 1 TBDP variables only. */
export const S_E_L_E_C_T_TOKENS = {
  color: v.color.text.primary,
  background: v.color.surface.base,
  border: v.color.border.default,
  radius: v.radius.md,
  padding: v.spacing.md,
  gap: v.spacing.sm,
  shadow: v.shadow["1"],
  font: v.font.body,
} as const;
