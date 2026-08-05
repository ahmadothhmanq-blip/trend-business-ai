import type { NotificationProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { notificationA11yProps } from "./accessibility";

export type { NotificationProps } from "./types";

export function Notification({
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
}: NotificationProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="notification" role="alert" className={tbdpClass("alert", { "info": true }, className)} {...rest}>
      {title ? <strong>{title}</strong> : null}
      {children ?? description}
    </div>
  );
}
