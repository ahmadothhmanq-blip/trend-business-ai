import type { AlertProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { alertA11yProps } from "./accessibility";

export type { AlertProps } from "./types";

export function Alert({
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
}: AlertProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="alert" role="alert" className={tbdpClass("alert", { "info": true }, className)} {...rest}>
      {title ? <strong>{title}</strong> : null}
      {children ?? description}
    </div>
  );
}
