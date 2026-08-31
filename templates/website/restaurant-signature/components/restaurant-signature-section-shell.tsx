"use client";

import type { ReactNode } from "react";

type RestaurantSignatureSectionShellProps = {
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

export function RestaurantSignatureSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: RestaurantSignatureSectionShellProps) {
  return (
    <section id={id} data-v2-component="restaurant-signature-section-shell" className={`p-6 sm:p-10 ${className}`.trim()} aria-labelledby={title ? `${id ?? "section"}-title` : undefined}>
      <div className="mx-auto max-w-[82rem] rounded-[2.5rem] border-4 border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] bg-[var(--color-surface)] p-8 sm:p-12">
        <SectionHeader p="rs" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {children}
      </div>
    </section>
  );
}
