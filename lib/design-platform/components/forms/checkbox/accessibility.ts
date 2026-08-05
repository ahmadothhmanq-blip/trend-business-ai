import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const C_H_E_C_K_B_O_X_A11Y = {
  componentId: "checkbox",
  
  wcagLevel: "AA" as const,
};

export function checkboxA11yProps(props: {
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
