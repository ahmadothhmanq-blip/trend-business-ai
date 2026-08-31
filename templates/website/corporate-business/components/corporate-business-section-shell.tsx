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

export function CorporateBusinessSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: CorporateBusinessSectionShellProps) {
  return (
    <section id={id} data-v2-component="corporate-business-section-shell" className={`cb-section relative bg-[var(--color-background)] ${className}`.trim()} aria-labelledby={title ? `${id ?? "section"}-title` : undefined}>
      <div className="cb-hero-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
        <SectionHeader p="cb" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} headerClass="mb-12 max-w-2xl" />
        {children}
      </div>
    </section>
  );
}
