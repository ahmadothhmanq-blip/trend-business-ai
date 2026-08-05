import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const P_R_O_D_U_C_T_D_E_T_A_I_L_S_A11Y = {
  componentId: "product-details",
  
  wcagLevel: "AA" as const,
};

export function productDetailsA11yProps(props: {
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
