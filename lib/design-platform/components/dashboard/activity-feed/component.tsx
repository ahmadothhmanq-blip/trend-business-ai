import type { ActivityFeedProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { activityFeedA11yProps } from "./accessibility";

export type { ActivityFeedProps } from "./types";

export function ActivityFeed({
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
}: ActivityFeedProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="activity-feed" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
