"use client";

import { SlotImage, hasSlotImage, splitSectionGridClass } from "@/lib/website/template-v2/slots";
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
  id,
  eyebrow,
  title,
  subtitle,
  body,
  imageUrl,
  highlights,
  primaryCta,
  primaryCtaHref,
  imageBadge,
}: FlagshipAboutProps) {
  if (!title && !subtitle && !body && !eyebrow && !imageUrl && !highlights?.length) return null;
  const sectionId = id ?? "about";
  const hasVisual = hasSlotImage("about", 0, imageUrl);

  return (
    <section
      id={sectionId}
      data-v2-component={componentId}
      aria-labelledby={`${sectionId}-title`}
      className={`${ui.section} bg-[var(--color-background)]`}
    >
      <div className={ui.container}>
        <div className={splitSectionGridClass(hasVisual)}>
          <div className={hasVisual ? undefined : "df-hero-editorial"}>
            <FlagshipSectionHeader
              ui={ui}
              id={sectionId}
              eyebrow={eyebrow}
              title={title}
              subtitle={subtitle}
              className="mb-0"
              align={hasVisual ? "start" : "center"}
            />
            {body ? <p className={`${ui.body} mt-6`}>{body}</p> : null}
            {highlights?.length ? (
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
              <a href={primaryCtaHref ?? "#contact"} className={`${ui.btnPrimary} mt-8 inline-flex ${ui.focusRing} ${hasVisual ? "" : "mx-auto"}`}>
                {primaryCta}
              </a>
            ) : null}
          </div>
          {hasVisual ? (
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
                  alt={title ?? ""}
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
          ) : null}
        </div>
      </div>
    </section>
  );
}
