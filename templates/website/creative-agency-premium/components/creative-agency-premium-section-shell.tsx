"use client";

import type { ReactNode } from "react";

type CreativeAgencyPremiumSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function CreativeAgencyPremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: CreativeAgencyPremiumSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="creative-agency-premium-section-shell"
      className={`sv-section px-5 sm:px-8 ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      {(eyebrow || title || subtitle) && (
        <header className="mb-12 max-w-2xl border-s-4 border-[var(--color-volt)] ps-6">
          {eyebrow && <p className="sv-eyebrow">{eyebrow}</p>}
          {title && (
            <h2 id={`${id ?? "section"}-title`} className="sv-headline-sm mt-4">
              {title}
            </h2>
          )}
          {subtitle && <p className="sv-body mt-4 text-lg leading-relaxed opacity-70">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
