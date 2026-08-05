"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_METRICS = [
  { value: "38%", label: "Pipeline velocity", trend: "+12% QoQ" },
  { value: "$2.4M", label: "ARR unlocked", trend: "avg. deal" },
  { value: "14d", label: "Time to value", trend: "median" },
  { value: "99.9%", label: "Uptime SLA", trend: "FY25" },
];

const TRUST_BRANDS = ["Vercel", "Linear", "Stripe", "Notion", "Figma", "Ramp"];

type SaasEnterpriseHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  metrics?: Array<{ value: string; label: string; trend?: string }>;
};

export function SaasEnterpriseHero({
  title = "Command your revenue operations at enterprise scale",
  subtitle = "Unify pipeline intelligence, forecast accuracy, and account expansion in one platform built for high-growth GTM teams.",
  eyebrow = "Revenue command platform",
  primaryCta = "Book a demo",
  secondaryCta = "View platform tour",
  imageUrl,
  metrics = DEFAULT_METRICS,
}: SaasEnterpriseHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="saas-enterprise-hero"
      aria-labelledby="se-hero-title"
      className="se-section relative min-h-[min(94vh,58rem)] overflow-hidden bg-[var(--color-background)] pb-12 pt-14 sm:pt-18 lg:pb-16 lg:pt-20"
    >
      <div className="se-grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div
        className="se-glow-orb pointer-events-none absolute start-1/4 top-0 h-80 w-80 bg-[var(--color-primary)]"
        aria-hidden
      />
      <div
        className="se-glow-orb pointer-events-none absolute end-0 top-1/4 h-64 w-64 bg-[var(--color-signal)] opacity-30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--border-accent)] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--color-surface)] px-3 py-1.5 motion-safe:animate-[se-slide-up_0.6s_ease_both]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-signal)] motion-safe:animate-[se-pulse-dot_2s_ease-in-out_infinite]"
                aria-hidden
              />
              <span className="se-eyebrow !text-[0.625rem] !tracking-[0.12em]">{eyebrow}</span>
            </div>

            <h1
              id="se-hero-title"
              className="se-headline mt-6 max-w-[13ch] motion-safe:animate-[se-slide-up_0.65s_ease_0.08s_both]"
            >
              {title}
            </h1>
            <p className="se-body mt-6 max-w-lg motion-safe:animate-[se-slide-up_0.65s_ease_0.16s_both]">
              {subtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3 motion-safe:animate-[se-slide-up_0.65s_ease_0.24s_both]">
              <a href="#contact" className="se-btn-primary se-focus-ring">
                {primaryCta}
              </a>
              <a href="/platform" className="se-btn-secondary se-focus-ring">
                {secondaryCta}
              </a>
            </div>

            <div className="mt-12 border-t border-[var(--border-subtle)] pt-8 motion-safe:animate-[se-slide-up_0.65s_ease_0.32s_both]">
              <p className="se-font-body mb-4 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                Trusted by GTM teams at
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Trusted by leading companies">
                {TRUST_BRANDS.map((brand) => (
                  <span key={brand} className="se-trust-logo">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 motion-safe:animate-[se-grid-reveal_0.85s_ease_0.15s_both]">
            <div className="se-browser-frame relative">
              <div className="se-browser-chrome" aria-hidden>
                <span className="se-browser-dot bg-red-400/60" />
                <span className="se-browser-dot bg-amber-400/60" />
                <span className="se-browser-dot bg-emerald-400/60" />
                <span className="se-font-mono ms-2 flex-1 rounded-md bg-[var(--color-background)] px-2 py-0.5 text-center text-[0.5625rem] text-[var(--color-muted)]">
                  app.northline.io/dashboard
                </span>
              </div>
              <SlotImage
                slot="hero"
                index={0}
                preferred={imageUrl}
                alt="Northline revenue command dashboard with pipeline analytics and forecast charts"
                className="aspect-[16/10] w-full object-cover object-top"
                priority
              />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {metrics.map((metric, i) => (
                <div
                  key={metric.label}
                  className="se-card p-4 motion-safe:animate-[se-grid-reveal_0.6s_ease_both]"
                  style={{ animationDelay: `${0.35 + i * 0.07}s` }}
                >
                  <dt className="se-metric text-2xl">{metric.value}</dt>
                  <dd className="se-font-body mt-1 text-[0.6875rem] text-[var(--color-muted)]">{metric.label}</dd>
                  {metric.trend ? (
                    <dd className="se-font-mono mt-0.5 text-[0.5625rem] text-[var(--color-signal)]">{metric.trend}</dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
