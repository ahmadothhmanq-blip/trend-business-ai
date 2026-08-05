import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const B_R_E_A_D_C_R_U_M_B_A11Y = {
  componentId: "breadcrumb",
  defaultRole: "navigation" as const,
  wcagLevel: "AA" as const,
};

export function breadcrumbA11yProps(props: {
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
