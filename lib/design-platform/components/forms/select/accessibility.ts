import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const S_E_L_E_C_T_A11Y = {
  componentId: "select",
  
  wcagLevel: "AA" as const,
};

export function selectA11yProps(props: {
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
