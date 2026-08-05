import type { ChartsWrapperProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { chartsWrapperA11yProps } from "./accessibility";

export type { ChartsWrapperProps } from "./types";

export function ChartsWrapper({
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
}: ChartsWrapperProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="charts-wrapper" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
