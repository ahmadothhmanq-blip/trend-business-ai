"use client";

import type { ReactNode } from "react";

type EcommercePremiumSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function EcommercePremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: EcommercePremiumSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="ecommerce-premium-section-shell"
      className={`ec-section bg-[var(--color-background)] ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        {(eyebrow || title || subtitle) && (
          <header className="mb-12 max-w-2xl">
            {eyebrow && <p className="ec-eyebrow mb-4">{eyebrow}</p>}
            {title && (
              <h2 id={`${id ?? "section"}-title`} className="ec-headline-sm">
                {title}
              </h2>
            )}
            {title && <div className="ec-gold-rule mt-5" aria-hidden />}
            {subtitle && <p className="ec-body mt-6">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
