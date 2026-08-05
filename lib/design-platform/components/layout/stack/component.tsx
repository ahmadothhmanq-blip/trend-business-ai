import type { StackProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { stackA11yProps } from "./accessibility";

export type { StackProps } from "./types";

export function Stack({
  size = "md",
  dir,
  className,
  children,
  title,
  description,
  label,
  disabled,
  loading,
  
  ...rest
}: StackProps) {return <div data-tbdp-ui data-tbdp-component="stack" className={tbdpClass("stack", { md: true }, className)} dir={dir} {...rest}>{children}</div>;
}
