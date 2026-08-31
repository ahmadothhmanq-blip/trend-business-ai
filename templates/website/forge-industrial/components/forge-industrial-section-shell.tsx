"use client";

import type { ReactNode } from "react";

type ForgeIndustrialSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function ForgeIndustrialSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: ForgeIndustrialSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="forge-industrial-section-shell"
      className={`fg-grid-paper fg-section ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="fg-frame">
          <p className="fg-fig-label">FIG. — SECTION SHELL</p>
          {(eyebrow || title || subtitle) ? (
            <header className="mt-4 mb-8 max-w-2xl">
              {eyebrow ? <p className="fg-eyebrow">{eyebrow}</p> : null}
              {title ? (
                <h2 id={`${id ?? "section"}-title`} className="fg-headline-sm mt-2">
                  {title}
                </h2>
              ) : null}
              {subtitle ? <p className="fg-body mt-4">{subtitle}</p> : null}
            </header>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
