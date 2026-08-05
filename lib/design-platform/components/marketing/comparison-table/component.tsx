import type { ComparisonTableProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { comparisonTableA11yProps } from "./accessibility";

export type { ComparisonTableProps } from "./types";

export function ComparisonTable({
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
}: ComparisonTableProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="comparison-table" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
