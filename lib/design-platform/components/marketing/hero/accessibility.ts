import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const H_E_R_O_A11Y = {
  componentId: "hero",
  
  wcagLevel: "AA" as const,
};

export function heroA11yProps(props: {
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
