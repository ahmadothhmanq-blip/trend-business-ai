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
  const titleId = title ? `${id ?? "section"}-title` : undefined;

  return (
    <section
      id={id}
      data-v2-component="real-estate-prestige-section-shell"
      className={`min-h-[40vh] bg-[var(--color-primary)] px-5 py-20 sm:px-8 sm:py-28 ${className}`.trim()}
      aria-labelledby={titleId}
    >
      <div className="mx-auto max-w-[88rem]">
        {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
        {title ? (
          <h2 id={titleId} className="rep-headline-sm text-balance">
            {title}
          </h2>
        ) : null}
        {subtitle ? <p className="rep-body max-w-xl">{subtitle}</p> : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}
