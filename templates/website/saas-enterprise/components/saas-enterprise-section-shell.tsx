"use client";

import type { ReactNode } from "react";

type SaasEnterpriseSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function SaasEnterpriseSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: SaasEnterpriseSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="saas-enterprise-section-shell"
      className={`se-section-shell se-reveal ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="se-docs-inner">
        {(eyebrow || title || subtitle) && (
          <header className="se-docs-head">
            {eyebrow ? <p className="se-eyebrow">{eyebrow}</p> : null}
            {title ? (
              <h2 id={`${id ?? "section"}-title`} className="se-headline-sm se-font-display">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="se-body">{subtitle}</p> : null}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
