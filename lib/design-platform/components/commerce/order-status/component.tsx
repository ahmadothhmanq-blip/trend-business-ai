import type { OrderStatusProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { orderStatusA11yProps } from "./accessibility";

export type { OrderStatusProps } from "./types";

export function OrderStatus({
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
}: OrderStatusProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="order-status" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
