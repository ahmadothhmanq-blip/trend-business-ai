import type { MegaMenuProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { megaMenuA11yProps } from "./accessibility";

export type { MegaMenuProps } from "./types";

export function MegaMenu({
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
}: MegaMenuProps) {
  return (
    <div data-tbdp-ui data-tbdp-component="mega-menu" dir={dir} className={className} {...rest}>
      {title ? <h2>{title}</h2> : null}
      {children ?? description}
    </div>
  );
}
