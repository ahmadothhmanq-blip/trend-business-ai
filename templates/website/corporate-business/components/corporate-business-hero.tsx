"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_METRICS = [
  { value: "500+", label: "Enterprise clients", trend: "Global footprint" },
  { value: "28", label: "Countries served", trend: "Active markets" },
  { value: "97%", label: "Client retention", trend: "3-year average" },
];

const TRUST_BRANDS = [
  "Goldman Sachs",
  "Siemens",
  "Deloitte",
  "McKinsey",
  "Accenture",
  "Blackstone",
  "JPMorgan",
];

type CorporateBusinessHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  metrics?: Array<{ value: string; label: string; trend?: string }>;
};

export function CorporateBusinessHero({
  title = "Strategy and execution for the enterprise",
  subtitle = "We help global organizations modernize operations, strengthen governance, and deliver lasting stakeholder value — with board-ready counsel and measurable outcomes.",
  eyebrow = "Corporate advisory",
  primaryCta = "Schedule consultation",
  secondaryCta = "Our capabilities",
  imageUrl,
  metrics = DEFAULT_METRICS,
}: CorporateBusinessHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="corporate-business-hero"
      aria-labelledby="cb-hero-title"
      className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)]"
    >
      <div className="cb-hero-atmosphere" aria-hidden />
      <div className="cb-hero-grid" aria-hidden />
      <div className="cb-paper-grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="cb-container relative flex min-h-[calc(100svh-5rem)] flex-col justify-center py-20 lg:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6 xl:col-span-5">
            <p className="cb-eyebrow mb-7">{eyebrow}</p>
            <h1 id="cb-hero-title" className="cb-headline max-w-[11ch]">
              {title}
            </h1>
            <p className="cb-body mt-10">{subtitle}</p>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a href="#contact" className="cb-btn-primary cb-focus-ring">
                {primaryCta}
              </a>
              <a href="#features" className="cb-btn-secondary cb-focus-ring">
                {secondaryCta}
              </a>
            </div>

            <div className="mt-20">
              <p className="cb-font-body mb-6 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Advising leaders at
              </p>
              <div className="cb-trust-fade overflow-hidden" aria-label="Trusted by leading organizations">
                <div className="cb-marquee-track flex w-max gap-14">
                  {[...TRUST_BRANDS, ...TRUST_BRANDS].map((brand, i) => (
                    <span key={`${brand}-${i}`} className="cb-trust-logo">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:col-span-6 xl:col-span-7">
            <div className="cb-hero-visual-glow" aria-hidden />
            <div className="relative ms-auto aspect-[4/5] max-w-[36rem] sm:aspect-[5/6]">
              <div
                className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl,20px)] border border-[var(--border-subtle)] bg-[var(--color-ink)] shadow-[var(--shadow-surface)]"
                aria-hidden
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(196,165,116,0.22),transparent_55%),radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(255,255,255,0.06),transparent_50%),linear-gradient(165deg,#0a1220_0%,#080e18_45%,#121c2e_100%)]" />
                <div
                  className="absolute inset-0 opacity-[0.18]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                  }}
                />
                <div className="absolute -end-8 top-[18%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(196,165,116,0.35),transparent_68%)] blur-2xl" />
                <div className="absolute start-[12%] top-[58%] h-px w-[76%] bg-gradient-to-r from-transparent via-[var(--color-signal)]/50 to-transparent" />
                <div className="absolute start-[12%] top-[68%] h-px w-[52%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="absolute inset-0 opacity-[0.14] mix-blend-overlay">
                  <SlotImage
                    slot="hero"
                    index={0}
                    preferred={imageUrl}
                    alt=""
                    className="h-full w-full scale-110 object-cover object-center saturate-0 contrast-125"
                    priority
                    aria-hidden
                  />
                </div>

                <div className="absolute inset-x-8 top-8 flex items-center justify-between">
                  <span className="cb-font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-white/35">
                    Meridian Atlas
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[var(--color-signal)] shadow-[0_0_16px_rgba(196,165,116,0.8)]" />
                </div>

                <div className="absolute inset-x-8 bottom-8 rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <p className="cb-font-display text-[clamp(1.5rem,2.5vw,2rem)] font-medium leading-tight text-white">
                    Board-ready counsel for global enterprises
                  </p>
                  <p className="cb-font-body mt-3 text-sm leading-relaxed text-white/55">
                    Strategy, governance, and transformation under one senior partner team.
                  </p>
                </div>
              </div>

              <div className="absolute -start-4 top-10 z-10 hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--color-surface)] px-5 py-4 shadow-[var(--shadow-surface)] sm:block lg:-start-8">
                <p className="cb-metric text-3xl">40yr</p>
                <p className="cb-metric-label mt-1">Partner tenure</p>
              </div>

              <div className="absolute -end-3 bottom-24 z-10 hidden rounded-[var(--radius-lg)] border border-white/10 bg-[var(--color-ink)] px-5 py-4 shadow-[var(--shadow-surface)] sm:block lg:-end-6">
                <p className="cb-font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-[var(--color-signal)]">
                  Retention
                </p>
                <p className="cb-font-display mt-1 text-3xl font-medium text-white">97%</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="cb-card-glass px-4 py-5 sm:px-5 sm:py-6">
                  <p className="cb-metric text-[clamp(1.5rem,2.5vw,2rem)]">{metric.value}</p>
                  <p className="cb-metric-label mt-2">{metric.label}</p>
                  {metric.trend ? <p className="cb-metric-detail mt-1.5">{metric.trend}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
