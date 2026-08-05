import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const T_I_M_E_L_I_N_E_A11Y = {
  componentId: "timeline",
  
  wcagLevel: "AA" as const,
};

export function timelineA11yProps(props: {
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
