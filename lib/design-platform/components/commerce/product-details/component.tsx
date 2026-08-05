import type { ProductDetailsProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { productDetailsA11yProps } from "./accessibility";

export type { ProductDetailsProps } from "./types";

export function ProductDetails({
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
}: ProductDetailsProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="product-details" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
