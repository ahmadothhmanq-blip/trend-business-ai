import type { StatsProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { statsA11yProps } from "./accessibility";

export type { StatsProps } from "./types";

export function Stats({
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
}: StatsProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="stats" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
