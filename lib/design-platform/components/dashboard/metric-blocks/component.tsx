import type { MetricBlocksProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { metricBlocksA11yProps } from "./accessibility";

export type { MetricBlocksProps } from "./types";

export function MetricBlocks({
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
}: MetricBlocksProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="metric-blocks" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
