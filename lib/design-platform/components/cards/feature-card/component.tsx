import type { FeatureCardProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { featureCardA11yProps } from "./accessibility";

export type { FeatureCardProps } from "./types";

export function FeatureCard({
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
}: FeatureCardProps) {
  return (
    <article data-tbdp-ui data-tbdp-component="feature-card" dir={dir} className={tbdpClass("card", {}, className)} {...rest}>
      {title ? <header className="tbdp-card__body"><h3>{title}</h3></header> : null}
      <div className="tbdp-card__body">{children ?? description}</div>
    </article>
  );
}
