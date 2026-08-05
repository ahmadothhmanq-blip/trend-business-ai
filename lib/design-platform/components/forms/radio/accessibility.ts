import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const R_A_D_I_O_A11Y = {
  componentId: "radio",
  
  wcagLevel: "AA" as const,
};

export function radioA11yProps(props: {
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
