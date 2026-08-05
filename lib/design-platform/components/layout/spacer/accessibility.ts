import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const S_P_A_C_E_R_A11Y = {
  componentId: "spacer",
  
  wcagLevel: "AA" as const,
};

export function spacerA11yProps(props: {
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
