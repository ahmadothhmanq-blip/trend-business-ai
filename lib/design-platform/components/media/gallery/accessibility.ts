import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const G_A_L_L_E_R_Y_A11Y = {
  componentId: "gallery",
  
  wcagLevel: "AA" as const,
};

export function galleryA11yProps(props: {
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
