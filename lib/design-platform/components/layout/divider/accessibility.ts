import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const D_I_V_I_D_E_R_A11Y = {
  componentId: "divider",
  
  wcagLevel: "AA" as const,
};

export function dividerA11yProps(props: {
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
