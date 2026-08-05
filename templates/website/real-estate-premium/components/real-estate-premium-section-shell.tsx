"use client";

import type { ReactNode } from "react";

type RealEstatePremiumSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "surface";
};

export function RealEstatePremiumSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  variant = "default",
}: RealEstatePremiumSectionShellProps) {
  const variantClass =
    variant === "dark"
      ? "bg-[var(--color-primary)] text-[var(--color-linen)]"
      : variant === "surface"
        ? "bg-[var(--color-surface)]"
        : "";

  return (
    <section
      id={id}
      data-v2-component="real-estate-premium-section-shell"
      className={`rep-section ${variantClass} ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="px-5 sm:px-8 lg:px-12">
        {(eyebrow || title || subtitle) && (
          <header className="mb-14 max-w-2xl">
            {eyebrow && (
              <p className={`rep-eyebrow mb-5 ${variant === "dark" ? "text-[var(--color-brass)]" : ""}`}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                id={`${id ?? "section"}-title`}
                className={`rep-headline-sm ${variant === "dark" ? "text-[var(--color-linen)]" : ""}`}
              >
                {title}
              </h2>
            )}
            {title && <div className="rep-brass-rule-lg my-7" />}
            {subtitle && (
              <p className={`rep-body ${variant === "dark" ? "text-[var(--color-linen)]/65" : ""}`}>
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
