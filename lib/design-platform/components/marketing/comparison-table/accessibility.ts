import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const C_O_M_P_A_R_I_S_O_N_T_A_B_L_E_A11Y = {
  componentId: "comparison-table",
  
  wcagLevel: "AA" as const,
};

export function comparisonTableA11yProps(props: {
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
