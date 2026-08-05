import type { TimelineProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { timelineA11yProps } from "./accessibility";

export type { TimelineProps } from "./types";

export function Timeline({
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
}: TimelineProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="timeline" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
