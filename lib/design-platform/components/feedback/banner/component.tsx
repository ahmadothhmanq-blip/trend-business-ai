import type { BannerProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { bannerA11yProps } from "./accessibility";

export type { BannerProps } from "./types";

export function Banner({
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
}: BannerProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="banner" role="alert" className={tbdpClass("alert", { "info": true }, className)} {...rest}>
      {title ? <strong>{title}</strong> : null}
      {children ?? description}
    </div>
  );
}
