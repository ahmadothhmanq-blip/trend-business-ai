import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const T_E_X_T_A_R_E_A_A11Y = {
  componentId: "textarea",
  
  wcagLevel: "AA" as const,
};

export function textareaA11yProps(props: {
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
