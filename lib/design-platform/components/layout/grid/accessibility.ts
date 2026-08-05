import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const G_R_I_D_A11Y = {
  componentId: "grid",
  
  wcagLevel: "AA" as const,
};

export function gridA11yProps(props: {
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
