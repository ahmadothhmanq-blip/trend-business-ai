import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const I_N_P_U_T_A11Y = {
  componentId: "input",
  
  wcagLevel: "AA" as const,
};

export function inputA11yProps(props: {
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
