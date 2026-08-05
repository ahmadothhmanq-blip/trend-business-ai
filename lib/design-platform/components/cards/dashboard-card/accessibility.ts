import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const D_A_S_H_B_O_A_R_D_C_A_R_D_A11Y = {
  componentId: "dashboard-card",
  
  wcagLevel: "AA" as const,
};

export function dashboardCardA11yProps(props: {
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
