"use client";

import type { ReactNode } from "react";

type RestaurantPremiumSectionShellProps = {
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

export function RestaurantPremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: RestaurantPremiumSectionShellProps) {
  return (
    <section id={id} data-v2-component="restaurant-premium-section-shell" className={`border-t-2 border-[var(--color-accent)]/25 bg-[var(--color-surface)] py-14 ${className}`.trim()} aria-labelledby={title ? `${id ?? "section"}-title` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <SectionHeader p="rp" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {children}
      </div>
    </section>
  );
}
