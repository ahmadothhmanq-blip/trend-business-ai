"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_METRICS = [
  { value: "$24B", label: "Assets under management", trend: "AUM" },
  { value: "140+", label: "Years of stewardship", trend: "Est. 1884" },
  { value: "98%", label: "Client retention", trend: "10-year avg." },
  { value: "42", label: "Global offices", trend: "Worldwide" },
];

const TRUST_BRANDS = ["SEC Registered", "FIDIC Compliant", "CFA Institute", "Bloomberg", "Morningstar"];

type FinancePremiumHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  metrics?: Array<{ value: string; label: string; trend?: string }>;
};

export function FinancePremiumHero({
  title = "Stewardship for generational wealth",
  subtitle = "Institutional-grade private banking, fiduciary advisory, and capital strategy for families and enterprises who value discretion, rigor, and enduring performance.",
  eyebrow = "Meridian Capital",
  primaryCta = "Schedule a consultation",
  secondaryCta = "Our services",
  imageUrl,
  metrics = DEFAULT_METRICS,
}: FinancePremiumHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="finance-premium-hero"
      aria-labelledby="fn-hero-title"
      className="fn-section fn-section-glow fn-paper-grain relative min-h-[min(92vh,56rem)] overflow-hidden bg-[var(--color-background)] py-16 sm:py-20 lg:py-24"
    >
      <div className="fn-grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div
        className="fn-glow-orb start-0 top-0 h-72 w-72 bg-[var(--color-signal)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="max-w-xl">
            <p className="fn-eyebrow mb-4 motion-safe:animate-[fn-slide-up_0.6s_ease_both]">{eyebrow}</p>
            <div className="fn-accent-line mb-6 motion-safe:animate-[fn-line-draw_0.7s_ease_0.05s_both]" aria-hidden />
            <h1
              id="fn-hero-title"
              className="fn-headline motion-safe:animate-[fn-slide-up_0.65s_ease_0.08s_both]"
            >
              {title}
            </h1>
            <p className="fn-body text-muted-foreground mt-6 max-w-lg motion-safe:animate-[fn-slide-up_0.65s_ease_0.16s_both]">
              {subtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3 motion-safe:animate-[fn-slide-up_0.65s_ease_0.24s_both]">
              <a href="#contact" className="fn-btn-primary fn-focus-ring">
                {primaryCta}
              </a>
              <a href="#services" className="fn-btn-secondary fn-focus-ring">
                {secondaryCta}
              </a>
            </div>
            <div className="mt-10 motion-safe:animate-[fn-slide-up_0.65s_ease_0.32s_both]">
              <p className="fn-font-body mb-3 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                Recognized by
              </p>
              <div className="fn-trust-strip" aria-label="Industry credentials">
                {TRUST_BRANDS.map((brand) => (
                  <span key={brand} className="fn-trust-logo">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="motion-safe:animate-[fn-grid-reveal_0.85s_ease_0.15s_both]">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-accent)] bg-[var(--color-ink)] p-1.5 shadow-[var(--shadow-surface)]">
              <div className="fn-gold-rule absolute inset-x-6 top-0 z-10" aria-hidden />
              <SlotImage
                slot="hero"
                index={0}
                preferred={imageUrl}
                alt="Private wealth advisory in an institutional boardroom"
                className="aspect-[4/3] w-full rounded-[calc(var(--radius-lg)-4px)] object-cover"
                priority
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {metrics.map((metric, i) => (
                <div
                  key={metric.label}
                  className="fn-card p-4 motion-safe:animate-[fn-grid-reveal_0.6s_ease_both]"
                  style={{ animationDelay: `${0.35 + i * 0.07}s` }}
                >
                  <p className="fn-metric text-2xl">{metric.value}</p>
                  <p className="fn-font-body mt-1 text-[0.6875rem] text-[var(--color-muted)]">{metric.label}</p>
                  {metric.trend ? (
                    <p className="fn-font-mono mt-0.5 text-[0.625rem] text-[var(--color-signal)]">{metric.trend}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
