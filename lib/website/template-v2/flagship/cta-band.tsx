"use client";

import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export type FlagshipCtaBandProps = {
  ui: FlagshipUi;
  componentId: string;
  id?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
};

export function FlagshipCtaBand({
  ui,
  componentId,
  id,
  title,
  subtitle,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
}: FlagshipCtaBandProps) {
  if (!title && !subtitle && !primaryCta) return null;
  const sectionId = id ?? "cta";

  return (
    <section
      id={sectionId}
      data-v2-component={componentId}
      aria-labelledby={`${sectionId}-title`}
      className={`${ui.section} bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-background))]`}
    >
      <div className={`${ui.container} text-center`}>
        {title ? (
          <h2 id={`${sectionId}-title`} className={ui.headlineSm}>
            {title}
          </h2>
        ) : null}
        {subtitle ? <p className={`${ui.body} mx-auto mt-4 max-w-2xl`}>{subtitle}</p> : null}
        {primaryCta ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={primaryHref ?? "#contact"} className={`${ui.btnPrimary} ${ui.focusRing}`}>
              {primaryCta}
            </a>
            {secondaryCta ? (
              <a href={secondaryHref ?? "#pricing"} className={`${ui.btnSecondary} ${ui.focusRing}`}>
                {secondaryCta}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
