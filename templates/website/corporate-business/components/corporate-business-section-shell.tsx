"use client";

import type { ReactNode } from "react";

type CorporateBusinessSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function CorporateBusinessSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: CorporateBusinessSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="corporate-business-section-shell"
      className={`cb-section bg-[var(--color-background)] ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) && (
          <header className="mb-12 max-w-2xl">
            {eyebrow && <p className="cb-eyebrow mb-3">{eyebrow}</p>}
            {title && (
              <h2 id={`${id ?? "section"}-title`} className="cb-headline-sm">
                {title}
              </h2>
            )}
            {subtitle && <p className="cb-body text-muted-foreground mt-4">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
