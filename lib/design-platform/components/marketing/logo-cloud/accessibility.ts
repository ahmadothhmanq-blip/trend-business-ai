import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const L_O_G_O_C_L_O_U_D_A11Y = {
  componentId: "logo-cloud",
  
  wcagLevel: "AA" as const,
};

export function logoCloudA11yProps(props: {
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
