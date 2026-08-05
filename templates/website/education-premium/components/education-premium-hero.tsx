"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_METRICS = [
  { value: "12:1", label: "Student-faculty ratio", trend: "Undergraduate" },
  { value: "94%", label: "Graduate placement", trend: "Within 6 months" },
  { value: "140+", label: "Degree programs", trend: "Across disciplines" },
  { value: "1892", label: "Founded", trend: "Heritage" },
];

const TRUST_BRANDS = ["AACSB Accredited", "Research Excellence", "Global Alumni", "Fulbright Scholars", "Campus Life"];

type EducationPremiumHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  metrics?: Array<{ value: string; label: string; trend?: string }>;
};

export function EducationPremiumHero({
  title = "Where tradition meets transformative learning",
  subtitle = "A research university where rigorous scholarship, distinguished faculty, and a vibrant campus community prepare graduates to lead in every field.",
  eyebrow = "Scholar's Hall · Est. 1892",
  primaryCta = "Apply for admission",
  secondaryCta = "Explore campus",
  imageUrl,
  metrics = DEFAULT_METRICS,
}: EducationPremiumHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="education-premium-hero"
      aria-labelledby="ed-hero-title"
      className="ed-section ed-section-glow ed-paper-grain relative min-h-[min(92vh,56rem)] overflow-hidden bg-[var(--color-background)] py-16 sm:py-20 lg:py-24"
    >
      <div className="ed-grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      <div className="relative mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="max-w-xl">
            <p className="ed-eyebrow mb-4 motion-safe:animate-[ed-slide-up_0.6s_ease_both]">{eyebrow}</p>
            <h1
              id="ed-hero-title"
              className="ed-headline motion-safe:animate-[ed-slide-up_0.65s_ease_0.08s_both]"
            >
              {title}
            </h1>
            <div className="ed-gold-rule mt-5 motion-safe:animate-[ed-line-draw_0.7s_ease_0.12s_both]" aria-hidden />
            <p className="ed-body mt-6 max-w-lg motion-safe:animate-[ed-slide-up_0.65s_ease_0.16s_both]">
              {subtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3 motion-safe:animate-[ed-slide-up_0.65s_ease_0.24s_both]">
              <a href="#admissions" className="ed-btn-primary ed-focus-ring">
                {primaryCta}
              </a>
              <a href="#campus" className="ed-btn-secondary ed-focus-ring">
                {secondaryCta}
              </a>
            </div>
            <div className="mt-10 space-y-5 motion-safe:animate-[ed-slide-up_0.65s_ease_0.32s_both]">
              <div>
                <p className="ed-font-body mb-3 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                  Campus distinctions
                </p>
                <div className="ed-trust-strip" aria-label="University credentials">
                  {TRUST_BRANDS.map((brand) => (
                    <span key={brand} className="ed-trust-logo">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="motion-safe:animate-[ed-grid-reveal_0.85s_ease_0.15s_both]">
            <div className="ed-card overflow-hidden p-1.5 shadow-[var(--shadow-surface)]">
              <SlotImage
                slot="hero"
                index={0}
                preferred={imageUrl}
                alt="Historic university campus with students on the quad"
                className="aspect-[4/3] w-full rounded-[calc(var(--radius-lg)-4px)] object-cover motion-safe:animate-[ed-ken-burns_1.2s_ease_both]"
                priority
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {metrics.map((metric, i) => (
                <div
                  key={metric.label}
                  className="ed-card p-4 motion-safe:animate-[ed-grid-reveal_0.6s_ease_both]"
                  style={{ animationDelay: `${0.35 + i * 0.07}s` }}
                >
                  <p className="ed-metric text-2xl">{metric.value}</p>
                  <p className="ed-font-body mt-1 text-[0.6875rem] text-[var(--color-muted)]">{metric.label}</p>
                  {metric.trend ? (
                    <p className="ed-font-mono mt-0.5 text-[0.625rem] text-[var(--color-signal)]">{metric.trend}</p>
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
