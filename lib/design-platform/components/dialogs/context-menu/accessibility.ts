import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const C_O_N_T_E_X_T_M_E_N_U_A11Y = {
  componentId: "context-menu",
  
  wcagLevel: "AA" as const,
};

export function contextMenuA11yProps(props: {
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
