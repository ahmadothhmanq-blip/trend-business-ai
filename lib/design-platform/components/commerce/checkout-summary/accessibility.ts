import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const C_H_E_C_K_O_U_T_S_U_M_M_A_R_Y_A11Y = {
  componentId: "checkout-summary",
  
  wcagLevel: "AA" as const,
};

export function checkoutSummaryA11yProps(props: {
  label?: string;
  describedBy?: string;
  disabled?: boolean;
}): TbdpA11yProps {
  return {
    
    ...(props.label ? { "aria-label": props.label } : {}),
    ...(props.describedBy ? { "aria-describedby": props.describedBy } : {}),
    ...(props.disabled ? { "aria-disabled": true, tabIndex: -1 } : {}),
  };
}
