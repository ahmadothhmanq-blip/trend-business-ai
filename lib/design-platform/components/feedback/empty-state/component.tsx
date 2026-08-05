import type { EmptyStateProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { emptyStateA11yProps } from "./accessibility";

export type { EmptyStateProps } from "./types";

export function EmptyState({
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
}: EmptyStateProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="empty-state" role="status" className={className} {...rest}>
      <p>{title ?? "No data"}</p>
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );
}
