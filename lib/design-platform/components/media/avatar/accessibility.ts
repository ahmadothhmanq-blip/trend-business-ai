import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const A_V_A_T_A_R_A11Y = {
  componentId: "avatar",
  
  wcagLevel: "AA" as const,
};

export function avatarA11yProps(props: {
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
