import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const L_O_A_D_I_N_G_S_T_A_T_E_A11Y = {
  componentId: "loading-state",
  
  wcagLevel: "AA" as const,
};

export function loadingStateA11yProps(props: {
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
