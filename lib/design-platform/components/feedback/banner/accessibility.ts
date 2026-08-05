import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const B_A_N_N_E_R_A11Y = {
  componentId: "banner",
  
  wcagLevel: "AA" as const,
};

export function bannerA11yProps(props: {
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
