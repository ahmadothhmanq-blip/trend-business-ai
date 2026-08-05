import type { PricingCardProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { pricingCardA11yProps } from "./accessibility";

export type { PricingCardProps } from "./types";

export function PricingCard({
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
}: PricingCardProps) {
  return (
    <article data-tbdp-ui data-tbdp-component="pricing-card" dir={dir} className={tbdpClass("card", {}, className)} {...rest}>
      {title ? <header className="tbdp-card__body"><h3>{title}</h3></header> : null}
      <div className="tbdp-card__body">{children ?? description}</div>
    </article>
  );
}
