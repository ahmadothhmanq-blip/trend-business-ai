import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const T_A_B_L_E_S_A11Y = {
  componentId: "tables",
  
  wcagLevel: "AA" as const,
};

export function tablesA11yProps(props: {
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
