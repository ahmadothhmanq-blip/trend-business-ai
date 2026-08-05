import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const S_T_A_C_K_A11Y = {
  componentId: "stack",
  
  wcagLevel: "AA" as const,
};

export function stackA11yProps(props: {
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
