import type { ContainerProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { containerA11yProps } from "./accessibility";

export type { ContainerProps } from "./types";

export function Container({
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
}: ContainerProps) {return <div data-tbdp-ui data-tbdp-component="container" className={tbdpClass("container", {}, className)} dir={dir} {...rest}>{children}</div>;
}
