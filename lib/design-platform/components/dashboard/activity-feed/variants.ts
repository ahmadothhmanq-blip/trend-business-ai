import { v } from "@/lib/design-platform/components/core";
import type { TbdpComponentSize } from "@/lib/design-platform/components/core";

export const A_C_T_I_V_I_T_Y_F_E_E_D_VARIANTS = {
  default: {
    color: v.color.text.primary,
    background: v.color.surface.base,
  },
  emphasis: {
    color: v.color.text.inverse,
    background: v.color.primary,
  },
} as const;

export const A_C_T_I_V_I_T_Y_F_E_E_D_SIZES: Record<TbdpComponentSize, { padding: string; fontSize: string }> = {
  xs: { padding: v.spacing.xs, fontSize: "0.75rem" },
  sm: { padding: v.spacing.sm, fontSize: "0.8125rem" },
  md: { padding: v.spacing.md, fontSize: "0.875rem" },
  lg: { padding: v.spacing.lg, fontSize: "1rem" },
  xl: { padding: v.spacing.xl, fontSize: "1.0625rem" },
};
