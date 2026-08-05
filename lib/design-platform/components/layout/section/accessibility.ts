import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const S_E_C_T_I_O_N_A11Y = {
  componentId: "section",
  
  wcagLevel: "AA" as const,
};

export function sectionA11yProps(props: {
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
