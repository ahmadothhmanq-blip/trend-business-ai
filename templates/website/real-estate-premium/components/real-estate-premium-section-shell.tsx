"use client";

import type { ReactNode } from "react";

type RealEstatePremiumSectionShellProps = {
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

export function RealEstatePremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: RealEstatePremiumSectionShellProps) {
  return (
    <section id={id} data-v2-component="real-estate-premium-section-shell" className={`bg-[var(--color-primary)] py-20 sm:py-28 text-[var(--color-foreground)] ${className}`.trim()} aria-labelledby={title ? `${id ?? "section"}-title` : undefined}>
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) ? (
          <header className="mb-14 max-w-2xl">
            {eyebrow ? <p className="rep-eyebrow mb-5 text-[var(--color-accent)]">{eyebrow}</p> : null}
            {title ? <h2 id={`${id ?? "section"}-title`} className="rep-headline-sm">{title}</h2> : null}
            {title ? <div className="my-7 h-px w-16 bg-[var(--color-accent)]" aria-hidden /> : null}
            {subtitle ? <p className="rep-body opacity-70">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
