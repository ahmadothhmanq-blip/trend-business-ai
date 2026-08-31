"use client";

import type { ReactNode } from "react";

type LuminaWellnessSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function LuminaWellnessSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: LuminaWellnessSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="lumina-wellness-section-shell"
      className={`lu-section ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      {(eyebrow || title || subtitle) ? (
        <header className="mx-auto mb-10 max-w-xl px-5 text-center sm:px-8">
          {eyebrow ? <p className="lu-eyebrow">{eyebrow}</p> : null}
          {title ? (
            <h2 id={`${id ?? "section"}-title`} className="lu-headline-sm mt-4">
              {title}
            </h2>
          ) : null}
          {subtitle ? <p className="lu-body mx-auto mt-4 max-w-md">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
