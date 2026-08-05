import type { LoadingStateProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { loadingStateA11yProps } from "./accessibility";

export type { LoadingStateProps } from "./types";

export function LoadingState({
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
}: LoadingStateProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="loading-state" role="status" aria-live="polite" className={className} {...rest}>
      {children ?? "Loading…"}
    </div>
  );
}
