import type { CheckoutSummaryProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { checkoutSummaryA11yProps } from "./accessibility";

export type { CheckoutSummaryProps } from "./types";

export function CheckoutSummary({
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
}: CheckoutSummaryProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="checkout-summary" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
