import type { CtaProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { ctaA11yProps } from "./accessibility";

export type { CtaProps } from "./types";

export function Cta({
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
}: CtaProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="cta" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
