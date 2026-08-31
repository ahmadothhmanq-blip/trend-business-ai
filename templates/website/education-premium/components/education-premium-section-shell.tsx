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
      className={`ed-section-shell ed-paper ed-reveal ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="ed-section-shell-inner">
        {(eyebrow || title || subtitle) && (
          <header className="ed-section-head">
            {eyebrow ? <p className="ed-eyebrow">{eyebrow}</p> : null}
            {title ? (
              <h2 id={`${id ?? "section"}-title`} className="ed-headline-sm ed-font-display">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="ed-body">{subtitle}</p> : null}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
