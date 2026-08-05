import type { MediaCardProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { mediaCardA11yProps } from "./accessibility";

export type { MediaCardProps } from "./types";

export function MediaCard({
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
}: MediaCardProps) {
  return (
    <article data-tbdp-ui data-tbdp-component="media-card" dir={dir} className={tbdpClass("card", {}, className)} {...rest}>
      {title ? <header className="tbdp-card__body"><h3>{title}</h3></header> : null}
      <div className="tbdp-card__body">{children ?? description}</div>
    </article>
  );
}
