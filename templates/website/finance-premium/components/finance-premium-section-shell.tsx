"use client";

import type { ReactNode } from "react";

type FinancePremiumSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function FinancePremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: FinancePremiumSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="finance-premium-section-shell"
      className={`fn-section bg-[var(--color-background)] ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) && (
          <header className="mb-12 max-w-2xl">
            {eyebrow && <p className="fn-eyebrow mb-3">{eyebrow}</p>}
            {title && (
              <h2 id={`${id ?? "section"}-title`} className="fn-headline-sm">
                {title}
              </h2>
            )}
            {title && <div className="fn-accent-line mt-4" aria-hidden />}
            {subtitle && <p className="fn-body text-muted-foreground mt-4">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
