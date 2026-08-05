import type { InputProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { inputA11yProps } from "./accessibility";

export type { InputProps } from "./types";

export function Input({
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
}: InputProps) {
  return (
    <input
      data-tbdp-ui
      data-tbdp-component="input"
      dir={dir}
      disabled={disabled}
      className={tbdpClass("input", { [size]: true }, className)}
      type="text"
      aria-label={label}
      placeholder={description}
      {...rest}
    />
  );
}
