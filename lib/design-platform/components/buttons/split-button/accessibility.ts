import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const S_P_L_I_T_B_U_T_T_O_N_A11Y = {
  componentId: "split-button",
  
  wcagLevel: "AA" as const,
};

export function splitButtonA11yProps(props: {
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
