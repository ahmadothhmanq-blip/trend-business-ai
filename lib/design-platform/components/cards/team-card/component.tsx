import type { TeamCardProps } from "./types";
import { tbdpClass } from "@/lib/design-platform/components/core";
import { teamCardA11yProps } from "./accessibility";

export type { TeamCardProps } from "./types";

export function TeamCard({
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
}: TeamCardProps) {
  return (
    <article data-tbdp-ui data-tbdp-component="team-card" dir={dir} className={tbdpClass("card", {}, className)} {...rest}>
      {title ? <header className="tbdp-card__body"><h3>{title}</h3></header> : null}
      <div className="tbdp-card__body">{children ?? description}</div>
    </article>
  );
}
