import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const E_M_P_T_Y_S_T_A_T_E_A11Y = {
  componentId: "empty-state",
  
  wcagLevel: "AA" as const,
};

export function emptyStateA11yProps(props: {
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
