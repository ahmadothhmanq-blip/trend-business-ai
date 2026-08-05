"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function FinancePremiumAbout({
  eyebrow = "Our philosophy",
  title = "Discipline, discretion, and generational thinking",
  subtitle,
  body = "For over a century, Meridian Capital has served as steward to families and institutions — combining institutional rigor with the personal attention only a private partnership can offer.",
  imageUrl,
  highlights = [
    "SEC-registered investment adviser",
    "Offices across North America, Europe, and Asia",
    "Fiduciary standard across all engagements",
  ],
  primaryCta = "Meet our partners",
}: Props) {
  return (
    <section
      id="about"
      data-v2-component="finance-premium-about"
      aria-labelledby="about-title"
      className="fn-section bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="fn-eyebrow mb-3">{eyebrow}</p>
            <h2 id="about-title" className="fn-headline-sm">
              {title}
            </h2>
            <div className="fn-accent-line mt-4" aria-hidden />
            {subtitle ? <p className="fn-body text-muted-foreground mt-4">{subtitle}</p> : null}
            <p className="fn-body text-muted-foreground mt-6">{body}</p>
            {highlights.length > 0 ? (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2" role="list">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="fn-font-body flex gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)]"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-signal)_14%,transparent)] text-[0.625rem] font-bold text-[var(--color-signal)]"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            <a href="#contact" className="fn-btn-primary fn-focus-ring mt-8 inline-flex">
              {primaryCta}
            </a>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-accent)] bg-[var(--color-ink)] p-1.5 shadow-[var(--shadow-surface)]">
              <div className="fn-gold-rule mb-1 opacity-50" aria-hidden />
              <SlotImage
                slot="about"
                index={0}
                preferred={imageUrl}
                alt="Meridian Capital partners in a private consultation"
                className="aspect-[4/3] w-full rounded-[calc(var(--radius-lg)-4px)] object-cover"
                loading="lazy"
              />
            </div>
            <p
              className="fn-font-body absolute -bottom-4 start-6 max-w-[14rem] rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--color-surface)] px-4 py-3 text-xs font-semibold text-[var(--color-foreground)] shadow-[var(--shadow-card)]"
            >
              Est. 1884 · New York
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
