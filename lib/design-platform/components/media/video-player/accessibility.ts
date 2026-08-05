import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const V_I_D_E_O_P_L_A_Y_E_R_A11Y = {
  componentId: "video-player",
  
  wcagLevel: "AA" as const,
};

export function videoPlayerA11yProps(props: {
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
