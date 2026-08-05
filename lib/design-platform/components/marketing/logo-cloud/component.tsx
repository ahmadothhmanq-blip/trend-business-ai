import type { LogoCloudProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { logoCloudA11yProps } from "./accessibility";

export type { LogoCloudProps } from "./types";

export function LogoCloud({
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
}: LogoCloudProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="logo-cloud" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
