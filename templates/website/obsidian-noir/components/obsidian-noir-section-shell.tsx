"use client";

import type { ReactNode } from "react";

type ObsidianNoirSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function ObsidianNoirSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: ObsidianNoirSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="obsidian-noir-section-shell"
      className={`ob-reveal ob-section px-5 sm:px-8 ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-[72rem]">
        {eyebrow || title || subtitle ? (
          <header className="mb-12 max-w-2xl">
            {eyebrow ? <p className="ob-eyebrow mb-4">{eyebrow}</p> : null}
            {title ? (
              <h2 id={`${id ?? "section"}-title`} className="ob-headline-sm">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="ob-body mt-4">{subtitle}</p> : null}
            <hr className="ob-rule mt-10" />
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
