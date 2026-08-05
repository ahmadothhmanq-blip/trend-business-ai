import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const E_R_R_O_R_S_T_A_T_E_A11Y = {
  componentId: "error-state",
  
  wcagLevel: "AA" as const,
};

export function errorStateA11yProps(props: {
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
