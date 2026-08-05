import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const F_I_L_E_U_P_L_O_A_D_A11Y = {
  componentId: "file-upload",
  
  wcagLevel: "AA" as const,
};

export function fileUploadA11yProps(props: {
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
