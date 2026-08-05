import type { HeroProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { heroA11yProps } from "./accessibility";

export type { HeroProps } from "./types";

export function Hero({
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
}: HeroProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="hero" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
