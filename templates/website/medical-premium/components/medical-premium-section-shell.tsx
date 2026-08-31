"use client";

import type { ReactNode } from "react";

type MedicalPremiumSectionShellProps = {
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

export function MedicalPremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: MedicalPremiumSectionShellProps) {
  return (
    <section id={id} data-v2-component="medical-premium-section-shell" className={`px-5 py-20 sm:py-28 sm:px-8 ${className}`.trim()} aria-labelledby={title ? `${id ?? "section"}-title` : undefined}>
      {(eyebrow || title || subtitle) ? (
        <header className="mx-auto mb-12 max-w-2xl text-center">
          {eyebrow ? <p className="mp-eyebrow mb-4">{eyebrow}</p> : null}
          {title ? <div className="mx-auto mb-5 h-px w-12 bg-[var(--color-accent)]" aria-hidden /> : null}
          {title ? <h2 id={`${id ?? "section"}-title`} className="mp-headline-sm">{title}</h2> : null}
          {subtitle ? <p className="mp-body mt-4 text-[var(--color-muted)]">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
