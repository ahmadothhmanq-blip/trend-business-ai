import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const S_T_A_T_S_A11Y = {
  componentId: "stats",
  
  wcagLevel: "AA" as const,
};

export function statsA11yProps(props: {
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
