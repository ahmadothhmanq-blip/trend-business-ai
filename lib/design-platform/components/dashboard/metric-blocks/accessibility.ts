import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const M_E_T_R_I_C_B_L_O_C_K_S_A11Y = {
  componentId: "metric-blocks",
  
  wcagLevel: "AA" as const,
};

export function metricBlocksA11yProps(props: {
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
