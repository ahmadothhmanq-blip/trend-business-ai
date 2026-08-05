import type { GridProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { gridA11yProps } from "./accessibility";

export type { GridProps } from "./types";

export function Grid({
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
}: GridProps) {return <div data-tbdp-ui data-tbdp-component="grid" className={tbdpClass("grid", { responsive: true }, className)} dir={dir} {...rest}>{children}</div>;
}
