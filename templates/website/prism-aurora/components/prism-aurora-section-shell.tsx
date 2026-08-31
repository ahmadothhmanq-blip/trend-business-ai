"use client";

import type { ReactNode } from "react";

type PrismAuroraSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function PrismAuroraSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: PrismAuroraSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="prism-aurora-section-shell"
      className={`pr-reveal pr-section bg-[var(--color-background)] px-4 sm:px-6 ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-[88rem]">
        {eyebrow || title || subtitle ? (
          <header className="mb-8 max-w-2xl">
            {eyebrow ? <p className="pr-eyebrow mb-3">{eyebrow}</p> : null}
            {title ? (
              <h2 id={`${id ?? "section"}-title`} className="pr-headline-sm">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="pr-body mt-4">{subtitle}</p> : null}
          </header>
        ) : null}
        <div className="pr-mosaic">{children}</div>
      </div>
    </section>
  );
}
