"use client";

import type { ReactNode } from "react";

type CreativePortfolioSectionShellProps = {
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

export function CreativePortfolioSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: CreativePortfolioSectionShellProps) {
  return (
    <section id={id} data-v2-component="creative-portfolio-section-shell" className={`py-16 ${className}`.trim()} aria-labelledby={title ? `${id ?? "section"}-title` : undefined}>
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        {(eyebrow || title) ? (
          <header className="df-reveal-stagger mb-12 grid gap-4 border-b border-[var(--border-default)] pb-8 lg:grid-cols-2 lg:items-end">
            <div>
              {eyebrow ? <p className="cp-eyebrow">{eyebrow}</p> : null}
              {title ? <h2 id={`${id ?? "section"}-title`} className="cp-display mt-2 text-4xl">{title}</h2> : null}
            </div>
            {subtitle ? <p className="cp-body text-[var(--color-muted)] lg:text-end">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
