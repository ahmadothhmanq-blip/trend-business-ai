import type { FeatureGridProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { featureGridA11yProps } from "./accessibility";

export type { FeatureGridProps } from "./types";

export function FeatureGrid({
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
}: FeatureGridProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="feature-grid" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
