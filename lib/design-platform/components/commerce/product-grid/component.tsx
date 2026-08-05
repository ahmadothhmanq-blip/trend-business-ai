import type { ProductGridProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { productGridA11yProps } from "./accessibility";

export type { ProductGridProps } from "./types";

export function ProductGrid({
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
}: ProductGridProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="product-grid" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
