import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const C_A_R_O_U_S_E_L_A11Y = {
  componentId: "carousel",
  
  wcagLevel: "AA" as const,
};

export function carouselA11yProps(props: {
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
