import type { KpiCardsProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { kpiCardsA11yProps } from "./accessibility";

export type { KpiCardsProps } from "./types";

export function KpiCards({
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
}: KpiCardsProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="kpi-cards" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
