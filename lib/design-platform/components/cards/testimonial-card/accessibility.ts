import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const T_E_S_T_I_M_O_N_I_A_L_C_A_R_D_A11Y = {
  componentId: "testimonial-card",
  
  wcagLevel: "AA" as const,
};

export function testimonialCardA11yProps(props: {
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
