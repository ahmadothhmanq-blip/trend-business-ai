import type { SelectProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { selectA11yProps } from "./accessibility";

export type { SelectProps } from "./types";

export function Select({
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
}: SelectProps) {
  return (
    <select
      data-tbdp-ui
      data-tbdp-component="select"
      dir={dir}
      disabled={disabled}
      className={tbdpClass("select", { [size]: true }, className)}
      aria-label={label}
      aria-describedby={description ? `${label}-desc` : undefined}
      {...rest}
    >
      {children}
    </select>
  );
}
