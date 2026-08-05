import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const T_E_A_M_C_A_R_D_A11Y = {
  componentId: "team-card",
  
  wcagLevel: "AA" as const,
};

export function teamCardA11yProps(props: {
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
