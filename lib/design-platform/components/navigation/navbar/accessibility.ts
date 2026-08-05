import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const N_A_V_B_A_R_A11Y = {
  componentId: "navbar",
  defaultRole: "navigation" as const,
  wcagLevel: "AA" as const,
};

export function navbarA11yProps(props: {
  label?: string;
  describedBy?: string;
  disabled?: boolean;
}): TbdpA11yProps {
  return {
    role: "navigation",
    ...(props.label ? { "aria-label": props.label } : {}),
    ...(props.describedBy ? { "aria-describedby": props.describedBy } : {}),
    ...(props.disabled ? { "aria-disabled": true, tabIndex: -1 } : {}),
  };
}
