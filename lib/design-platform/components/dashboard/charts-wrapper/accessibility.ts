import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const C_H_A_R_T_S_W_R_A_P_P_E_R_A11Y = {
  componentId: "charts-wrapper",
  
  wcagLevel: "AA" as const,
};

export function chartsWrapperA11yProps(props: {
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
