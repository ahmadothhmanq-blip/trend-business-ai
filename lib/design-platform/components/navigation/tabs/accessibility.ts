import type { TbdpA11yProps } from "@/lib/design-platform/components/core";

export const T_A_B_S_A11Y = {
  componentId: "tabs",
  defaultRole: "tablist" as const,
  wcagLevel: "AA" as const,
};

export function tabsA11yProps(props: {
  label?: string;
  describedBy?: string;
  disabled?: boolean;
}): TbdpA11yProps {
  return {
    role: "tablist",
    ...(props.label ? { "aria-label": props.label } : {}),
    ...(props.describedBy ? { "aria-describedby": props.describedBy } : {}),
    ...(props.disabled ? { "aria-disabled": true, tabIndex: -1 } : {}),
  };
}
