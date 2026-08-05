import type { BreadcrumbProps } from "./types";
import { tbdpClass, v } from "@/lib/design-platform/components/core";
import { breadcrumbA11yProps } from "./accessibility";

export type { BreadcrumbProps } from "./types";

export function Breadcrumb({
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
}: BreadcrumbProps) {
  return (
    <nav data-tbdp-ui data-tbdp-component="breadcrumb" aria-label={label ?? "Breadcrumb"} dir={dir} className={className} {...rest}>
      <ol style={{ display: "flex", gap: v.spacing.sm, listStyle: "none", margin: 0, padding: 0 }}>{children}</ol>
    </nav>
  );
}
