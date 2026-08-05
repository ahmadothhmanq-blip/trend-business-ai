import type { NavbarProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { navbarA11yProps } from "./accessibility";

export type { NavbarProps } from "./types";

export function Navbar({
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
}: NavbarProps) {
  return (
    <header data-tbdp-ui data-tbdp-component="navbar" dir={dir} className={tbdpClass("navbar", {}, className)} {...rest}>
      {children}
    </header>
  );
}
