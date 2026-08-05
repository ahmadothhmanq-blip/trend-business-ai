import type { SidebarProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { sidebarA11yProps } from "./accessibility";

export type { SidebarProps } from "./types";

export function Sidebar({
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
}: SidebarProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="sidebar" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
