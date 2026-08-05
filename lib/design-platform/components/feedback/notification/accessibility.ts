import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const N_O_T_I_F_I_C_A_T_I_O_N_A11Y = {
  componentId: "notification",
  
  wcagLevel: "AA" as const,
};

export function notificationA11yProps(props: {
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
