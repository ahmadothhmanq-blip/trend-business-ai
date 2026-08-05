import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const D_R_A_W_E_R_A11Y = {
  componentId: "drawer",
  
  wcagLevel: "AA" as const,
};

export function drawerA11yProps(props: {
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
