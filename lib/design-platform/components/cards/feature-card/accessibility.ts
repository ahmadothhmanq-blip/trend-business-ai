import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const F_E_A_T_U_R_E_C_A_R_D_A11Y = {
  componentId: "feature-card",
  
  wcagLevel: "AA" as const,
};

export function featureCardA11yProps(props: {
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
