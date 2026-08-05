"use client";

import type { ReactNode } from "react";

type CreativePortfolioSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function CreativePortfolioSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: CreativePortfolioSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="creative-portfolio-section-shell"
      className={`cp-section px-5 sm:px-8 ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      {(eyebrow || title || subtitle) && (
        <header className="mb-10 max-w-2xl">
          {eyebrow && <p className="cp-eyebrow">{eyebrow}</p>}
          {title && (
            <h2 id={`${id ?? "section"}-title`} className="cp-headline-sm mt-3">
              {title}
            </h2>
          )}
          {subtitle && <p className="cp-body mt-3">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
