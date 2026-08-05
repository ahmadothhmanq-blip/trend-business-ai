import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const O_R_D_E_R_S_T_A_T_U_S_A11Y = {
  componentId: "order-status",
  
  wcagLevel: "AA" as const,
};

export function orderStatusA11yProps(props: {
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
