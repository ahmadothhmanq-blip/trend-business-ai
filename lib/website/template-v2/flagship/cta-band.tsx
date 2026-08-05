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
  id = "cta",
  title = "Ready to move forward?",
  subtitle = "Join thousands of teams who ship faster with a platform built for scale.",
  primaryCta = "Get started",
  primaryHref = "#contact",
  secondaryCta,
  secondaryHref = "#pricing",
}: FlagshipCtaBandProps) {
  return (
    <section
      id={id}
      data-v2-component={componentId}
      aria-labelledby={`${id}-title`}
      className={`${ui.section} bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-background))]`}
    >
      <div className={`${ui.container} text-center`}>
        <h2 id={`${id}-title`} className={ui.headlineSm}>
          {title}
        </h2>
        <p className={`${ui.body} mx-auto mt-4 max-w-2xl`}>{subtitle}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={primaryHref} className={`${ui.btnPrimary} ${ui.focusRing}`}>
            {primaryCta}
          </a>
          {secondaryCta ? (
            <a href={secondaryHref} className={`${ui.btnSecondary} ${ui.focusRing}`}>
              {secondaryCta}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
