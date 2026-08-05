import type { TestimonialCardProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { testimonialCardA11yProps } from "./accessibility";

export type { TestimonialCardProps } from "./types";

export function TestimonialCard({
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
}: TestimonialCardProps) {
  return (
    <article data-tbdp-ui data-tbdp-component="testimonial-card" dir={dir} className={tbdpClass("card", {}, className)} {...rest}>
      {title ? <header className="tbdp-card__body"><h3>{title}</h3></header> : null}
      <div className="tbdp-card__body">{children ?? description}</div>
    </article>
  );
}
