"use client";

import type { ReactNode } from "react";

type EcommercePremiumSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function EcommercePremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: EcommercePremiumSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="ecommerce-premium-section-shell"
      className={`ec-section-shell ec-reveal ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="ec-section-shell-inner">
        {(eyebrow || title || subtitle) && (
          <header className="ec-section-head">
            {eyebrow ? <p className="ec-eyebrow">{eyebrow}</p> : null}
            {title ? (
              <h2 id={`${id ?? "section"}-title`} className="ec-headline-sm ec-font-display">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="ec-body">{subtitle}</p> : null}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
