import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const P_R_O_D_U_C_T_G_R_I_D_A11Y = {
  componentId: "product-grid",
  
  wcagLevel: "AA" as const,
};

export function productGridA11yProps(props: {
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
