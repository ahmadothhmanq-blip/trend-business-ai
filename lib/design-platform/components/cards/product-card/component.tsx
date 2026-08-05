import type { ProductCardProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { productCardA11yProps } from "./accessibility";

export type { ProductCardProps } from "./types";

export function ProductCard({
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
}: ProductCardProps) {
  return (
    <article data-tbdp-ui data-tbdp-component="product-card" dir={dir} className={tbdpClass("card", {}, className)} {...rest}>
      {title ? <header className="tbdp-card__body"><h3>{title}</h3></header> : null}
      <div className="tbdp-card__body">{children ?? description}</div>
    </article>
  );
}
