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

function SectionHeader({ p, id, eyebrow, title, subtitle, headerClass = "mb-9 max-w-2xl" }: { p: string; id?: string; eyebrow?: string; title?: string; subtitle?: string; headerClass?: string }) {
  if (!eyebrow && !title && !subtitle) return null;
  const titleId = `${id ?? "section"}-title`;
  return (
    <header className={headerClass}>
      {eyebrow ? <p className={`${p}-eyebrow mb-3`}>{eyebrow}</p> : null}
      {title ? <h2 id={titleId} className={`${p}-headline-sm`}>{title}</h2> : null}
      {subtitle ? <p className={`${p}-body mt-4 text-[var(--color-muted)]`}>{subtitle}</p> : null}
    </header>
  );
}

export function CreativeAgencyPremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: CreativeAgencyPremiumSectionShellProps) {
  return (
    <section id={id} data-v2-component="creative-agency-premium-section-shell" className={`sv-section px-5 sm:px-8 ${className}`.trim()} aria-labelledby={title ? `${id ?? "section"}-title` : undefined}>
      {(eyebrow || title || subtitle) ? (
        <header className="mb-12 max-w-2xl border-s-4 border-[var(--color-accent)] ps-6">
          {eyebrow ? <p className="sv-eyebrow">{eyebrow}</p> : null}
          {title ? <h2 id={`${id ?? "section"}-title`} className="sv-headline-sm mt-4">{title}</h2> : null}
          {subtitle ? <p className="sv-body mt-4 text-lg opacity-70">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
