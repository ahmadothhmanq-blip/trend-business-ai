"use client";

import type { ReactNode } from "react";

type RestaurantSignatureSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "inset" | "full-bleed";
};

export function RestaurantSignatureSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  variant = "default",
}: RestaurantSignatureSectionShellProps) {
  const variantClass =
    variant === "inset"
      ? "bg-[var(--color-surface)]/30"
      : variant === "full-bleed"
        ? "px-0"
        : "";

  return (
    <section
      id={id}
      data-v2-component="restaurant-signature-section-shell"
      className={`rs-section ${variantClass} ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        {(eyebrow || title || subtitle) && (
          <header className="mb-12 max-w-2xl">
            {eyebrow && <p className="rs-eyebrow mb-5">{eyebrow}</p>}
            {title && (
              <h2
                id={`${id ?? "section"}-title`}
                className="rs-headline text-[clamp(2rem,4vw,3rem)]"
              >
                {title}
              </h2>
            )}
            {title && <div className="rs-copper-rule my-6" />}
            {subtitle && <p className="rs-body">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
