"use client";

import type { ReactNode } from "react";

type MedicalPremiumSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  centered?: boolean;
};

export function MedicalPremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  centered = false,
}: MedicalPremiumSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="medical-premium-section-shell"
      className={`mp-section px-5 sm:px-8 ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      {(eyebrow || title || subtitle) && (
        <header className={`mx-auto mb-12 max-w-2xl ${centered ? "text-center" : ""}`.trim()}>
          {eyebrow && <p className="mp-eyebrow mb-4">{eyebrow}</p>}
          {title && (
            <>
              <div className={`mp-sage-rule mb-5 ${centered ? "mx-auto" : ""}`.trim()} aria-hidden />
              <h2 id={`${id ?? "section"}-title`} className="mp-headline-sm">
                {title}
              </h2>
            </>
          )}
          {subtitle && (
            <p className="mp-body text-muted-foreground mt-4 text-base leading-relaxed">{subtitle}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
