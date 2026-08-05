import type { DividerProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { dividerA11yProps } from "./accessibility";

export type { DividerProps } from "./types";

export function Divider({
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
}: DividerProps) {return <hr data-tbdp-ui data-tbdp-component="divider" className={tbdpClass("divider", {}, className)} {...rest} />;
}
