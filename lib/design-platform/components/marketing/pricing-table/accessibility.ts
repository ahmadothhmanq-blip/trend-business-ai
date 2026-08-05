import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const P_R_I_C_I_N_G_T_A_B_L_E_A11Y = {
  componentId: "pricing-table",
  
  wcagLevel: "AA" as const,
};

export function pricingTableA11yProps(props: {
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
