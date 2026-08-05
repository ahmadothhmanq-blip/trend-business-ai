import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const M_E_G_A_M_E_N_U_A11Y = {
  componentId: "mega-menu",
  defaultRole: "navigation" as const,
  wcagLevel: "AA" as const,
};

export function megaMenuA11yProps(props: {
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
