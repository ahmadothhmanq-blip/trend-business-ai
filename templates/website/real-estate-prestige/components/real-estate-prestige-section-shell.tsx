"use client";

import type { ReactNode } from "react";

type RealEstatePrestigeSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function RealEstatePrestigeSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: RealEstatePrestigeSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="real-estate-prestige-section-shell"
      className={`rep-section ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="px-5 sm:px-8 lg:px-10">
        {(eyebrow || title || subtitle) && (
          <header className="mb-12 max-w-2xl">
            {eyebrow && <p className="rep-eyebrow mb-5">{eyebrow}</p>}
            {title && (
              <h2 id={`${id ?? "section"}-title`} className="rep-headline-sm">
                {title}
              </h2>
            )}
            {title && <div className="rep-brass-rule my-6" />}
            {subtitle && <p className="rep-body">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
