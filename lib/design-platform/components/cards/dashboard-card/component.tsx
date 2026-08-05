import type { DashboardCardProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { dashboardCardA11yProps } from "./accessibility";

export type { DashboardCardProps } from "./types";

export function DashboardCard({
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
}: DashboardCardProps) {
  return (
    <article data-tbdp-ui data-tbdp-component="dashboard-card" dir={dir} className={tbdpClass("card", {}, className)} {...rest}>
      {title ? <header className="tbdp-card__body"><h3>{title}</h3></header> : null}
      <div className="tbdp-card__body">{children ?? description}</div>
    </article>
  );
}
