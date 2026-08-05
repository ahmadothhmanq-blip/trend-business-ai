import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const T_O_O_L_T_I_P_A11Y = {
  componentId: "tooltip",
  
  wcagLevel: "AA" as const,
};

export function tooltipA11yProps(props: {
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
