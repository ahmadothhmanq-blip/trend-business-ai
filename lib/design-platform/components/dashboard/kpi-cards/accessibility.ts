import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const K_P_I_C_A_R_D_S_A11Y = {
  componentId: "kpi-cards",
  
  wcagLevel: "AA" as const,
};

export function kpiCardsA11yProps(props: {
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
