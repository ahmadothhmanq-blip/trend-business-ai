import type { CheckboxProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { checkboxA11yProps } from "./accessibility";

export type { CheckboxProps } from "./types";

export function Checkbox({
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
}: CheckboxProps) {
  return (
    <input
      data-tbdp-ui
      data-tbdp-component="checkbox"
      dir={dir}
      disabled={disabled}
      className={tbdpClass("input", { [size]: true }, className)}
      type="checkbox"
      aria-label={label}
      placeholder={description}
      {...rest}
    />
  );
}
