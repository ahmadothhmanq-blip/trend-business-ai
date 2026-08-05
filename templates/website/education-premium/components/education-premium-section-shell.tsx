"use client";

import type { ReactNode } from "react";

type EducationPremiumSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function EducationPremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: EducationPremiumSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="education-premium-section-shell"
      className={`ed-section ed-paper-grain bg-[var(--color-background)] ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) && (
          <header className="mb-12 max-w-2xl">
            {eyebrow && <p className="ed-eyebrow mb-3">{eyebrow}</p>}
            {title && (
              <h2 id={`${id ?? "section"}-title`} className="ed-headline-sm">
                {title}
              </h2>
            )}
            {subtitle && <p className="ed-body mt-4">{subtitle}</p>}
            {(eyebrow || title) && <div className="ed-accent-line mt-4" aria-hidden />}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
