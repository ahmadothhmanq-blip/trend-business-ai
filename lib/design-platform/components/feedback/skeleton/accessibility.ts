import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const S_K_E_L_E_T_O_N_A11Y = {
  componentId: "skeleton",
  
  wcagLevel: "AA" as const,
};

export function skeletonA11yProps(props: {
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
