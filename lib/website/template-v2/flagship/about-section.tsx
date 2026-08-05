"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import { FlagshipSectionHeader } from "@/lib/website/template-v2/flagship/section-header";
import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export type FlagshipAboutProps = {
  ui: FlagshipUi;
  componentId: string;
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
  primaryCtaHref?: string;
  imageBadge?: string;
};

export function FlagshipAboutSection({
  ui,
  componentId,
  id = "about",
  eyebrow = "About us",
  title = "A partner built for lasting impact",
  subtitle,
  body = "We combine deep industry expertise with a relentless focus on outcomes — helping organizations modernize, scale, and lead with confidence.",
  imageUrl,
  highlights = [],
  primaryCta,
  primaryCtaHref = "#contact",
  imageBadge,
}: FlagshipAboutProps) {
  return (
    <section
      id={id}
      data-v2-component={componentId}
      aria-labelledby={`${id}-title`}
      className={`${ui.section} bg-[var(--color-background)]`}
    >
      <div className={ui.container}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <FlagshipSectionHeader
              ui={ui}
              id={id}
              eyebrow={eyebrow}
              title={title}
              subtitle={subtitle}
              className="mb-0"
            />
            <p className={`${ui.body} mt-6`}>{body}</p>
            {highlights.length > 0 ? (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2" role="list">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className={`${ui.fontBody} flex gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)]`}
                  >
                    <span
                      className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[0.625rem] font-bold text-[var(--color-accent)]"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {primaryCta ? (
              <a href={primaryCtaHref} className={`${ui.btnPrimary} mt-8 inline-flex ${ui.focusRing}`}>
                {primaryCta}
              </a>
            ) : null}
          </div>
          <div className="relative">
            <div
              className={`${ui.card} overflow-hidden p-1.5`}
              style={{
                background:
                  "linear-gradient(145deg, color-mix(in srgb, var(--color-accent) 18%, transparent), color-mix(in srgb, var(--color-primary) 8%, transparent))",
              }}
            >
              <div className="overflow-hidden rounded-[calc(var(--radius-lg)-6px)] bg-[var(--color-surface)]">
                <SlotImage
                  slot="about"
                  index={0}
                  preferred={imageUrl}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            {imageBadge ? (
              <p
                className={`${ui.fontBody} absolute -bottom-4 start-6 max-w-[14rem] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] px-4 py-3 text-xs font-semibold text-[var(--color-foreground)] shadow-[var(--shadow-card)]`}
              >
                {imageBadge}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
