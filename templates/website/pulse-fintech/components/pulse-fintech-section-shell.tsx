"use client";

import type { ReactNode } from "react";

type PulseFintechSectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function PulseFintechSectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: PulseFintechSectionShellProps) {
  return (
    <section
      id={id}
      data-v2-component="pulse-fintech-section-shell"
      className={`pu-reveal pu-section px-4 sm:px-6 ${className}`.trim()}
      aria-labelledby={title ? `${id ?? "section"}-title` : undefined}
    >
      <div className="mx-auto max-w-[96rem]">
        <div className="pu-panel">
          {(eyebrow || title || subtitle) && (
            <div className="pu-panel-head">
              <span>{eyebrow ?? "SECTION"}</span>
              <span className="inline-flex items-center gap-2">
                <span className="pu-live-dot" aria-hidden />
                READY
              </span>
            </div>
          )}
          <div className="pu-panel-body">
            {title ? (
              <h2 id={`${id ?? "section"}-title`} className="pu-headline-sm">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="pu-body mt-2">{subtitle}</p> : null}
            <div className={title || subtitle ? "mt-5" : undefined}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
