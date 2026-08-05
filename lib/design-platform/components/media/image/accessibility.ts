import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const I_M_A_G_E_A11Y = {
  componentId: "image",
  
  wcagLevel: "AA" as const,
};

export function imageA11yProps(props: {
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
