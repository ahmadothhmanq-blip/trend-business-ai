import type { AvatarProps } from "./types";
import { v } from "@/lib/design-platform/components/core";
import { avatarA11yProps } from "./accessibility";

export type { AvatarProps } from "./types";

export function Avatar({
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
}: AvatarProps) {
  return (
    <span data-tbdp-ui data-tbdp-component="avatar" role="img" aria-label={label ?? "Avatar"} className={className} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: v.radius.circle, background: v.color.surface.raised, width: v.spacing["2xl"], height: v.spacing["2xl"], overflow: "hidden" }} {...rest}>
      {children ?? label?.charAt(0)}
    </span>
  );
}
