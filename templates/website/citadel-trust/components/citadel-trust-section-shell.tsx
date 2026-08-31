"use client";

import type { ReactNode } from "react";

type CitadelTrustSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function CitadelTrustSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: CitadelTrustSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="citadel-trust-section-shell"
      className={`ct-dossier ct-section ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="ct-doc">
          {(eyebrow || title || subtitle) ? (
            <header className="mb-8">
              <p className="ct-doc-ribbon">
                <span className="ct-doc-seal-mark" aria-hidden />
                Document
              </p>
              {eyebrow ? <p className="ct-eyebrow">{eyebrow}</p> : null}
              {title ? (
                <h2 id={`${id ?? "section"}-title`} className="ct-headline-sm mt-3">
                  {title}
                </h2>
              ) : null}
              {subtitle ? <p className="ct-body mt-4">{subtitle}</p> : null}
            </header>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
