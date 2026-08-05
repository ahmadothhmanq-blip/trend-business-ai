import type { PricingTableProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { pricingTableA11yProps } from "./accessibility";

export type { PricingTableProps } from "./types";

export function PricingTable({
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
}: PricingTableProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="pricing-table" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
