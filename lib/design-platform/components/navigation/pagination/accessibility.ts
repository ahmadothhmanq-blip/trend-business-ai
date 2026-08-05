import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const P_A_G_I_N_A_T_I_O_N_A11Y = {
  componentId: "pagination",
  defaultRole: "navigation" as const,
  wcagLevel: "AA" as const,
};

export function paginationA11yProps(props: {
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
