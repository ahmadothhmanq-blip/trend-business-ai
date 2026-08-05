import type { ErrorStateProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { errorStateA11yProps } from "./accessibility";

export type { ErrorStateProps } from "./types";

export function ErrorState({
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
}: ErrorStateProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="error-state" role="alert" className={tbdpClass("alert", { "danger": true }, className)} {...rest}>
      {title ? <strong>{title}</strong> : null}
      {children ?? description}
    </div>
  );
}
