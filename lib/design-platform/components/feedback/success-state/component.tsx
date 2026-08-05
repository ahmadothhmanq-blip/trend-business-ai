import type { SuccessStateProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { successStateA11yProps } from "./accessibility";

export type { SuccessStateProps } from "./types";

export function SuccessState({
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
}: SuccessStateProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="success-state" role="alert" className={tbdpClass("alert", { "success": true }, className)} {...rest}>
      {title ? <strong>{title}</strong> : null}
      {children ?? description}
    </div>
  );
}
