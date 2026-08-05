import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const I_C_O_N_B_U_T_T_O_N_A11Y = {
  componentId: "icon",
  defaultRole: "button" as const,
  wcagLevel: "AA" as const,
};

export function iconButtonA11yProps(props: {
  label?: string;
  describedBy?: string;
  disabled?: boolean;
}): TbdpA11yProps {
  return {
    role: "button",
    ...(props.label ? { "aria-label": props.label } : {}),
    ...(props.describedBy ? { "aria-describedby": props.describedBy } : {}),
    ...(props.disabled ? { "aria-disabled": true, tabIndex: -1 } : {}),
  };
}
