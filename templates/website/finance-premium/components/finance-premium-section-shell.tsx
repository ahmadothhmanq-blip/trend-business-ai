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

export function FinancePremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: FinancePremiumSectionShellProps) {
  return (
    <section id={id} data-v2-component="finance-premium-section-shell" className={`fn-section bg-[var(--color-background)] ${className}`.trim()} aria-labelledby={title ? `${id ?? "section"}-title` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) ? (
          <header className="mb-12 max-w-2xl">
            {eyebrow ? <p className="fn-eyebrow mb-3">{eyebrow}</p> : null}
            {title ? <h2 id={`${id ?? "section"}-title`} className="fn-headline-sm">{title}</h2> : null}
            {title ? <div className="mt-4 h-px w-12 bg-gradient-to-r from-[var(--color-accent)] to-transparent" aria-hidden /> : null}
            {subtitle ? <p className="fn-body mt-4 text-[var(--color-muted)]">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
