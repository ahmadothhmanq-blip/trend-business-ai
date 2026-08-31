"use client";

import type { ReactNode } from "react";

type AiStartupSignalSectionShellProps = {
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

export function AiStartupSignalSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: AiStartupSignalSectionShellProps) {
  return (
    <section id={id} data-v2-component="ai-startup-signal-section-shell" className={`as-section-glow py-20 sm:py-28 ${className}`.trim()} aria-labelledby={title ? `${id ?? "section"}-title` : undefined}>
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="as-glass-card rounded-2xl border border-[var(--border-signal)] p-8 backdrop-blur sm:p-10">
          <SectionHeader p="as" id={id} eyebrow={eyebrow} title={title} subtitle={subtitle} />
          {children}
        </div>
      </div>
    </section>
  );
}
