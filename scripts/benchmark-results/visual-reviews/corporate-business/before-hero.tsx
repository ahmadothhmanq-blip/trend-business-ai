"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_METRICS = [
  { value: "500+", label: "Enterprise clients", trend: "Global footprint" },
  { value: "28", label: "Countries served", trend: "Active markets" },
  { value: "97%", label: "Client retention", trend: "3-year average" },
  { value: "40yr", label: "Partner tenure", trend: "Combined leadership" },
];

const TRUST_BRANDS = ["Goldman Sachs", "Siemens", "Deloitte", "McKinsey", "Accenture"];

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
      className="relative overflow-hidden bg-[var(--color-background)] pb-16 pt-8 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-16"
    >
      <div className="cb-paper-grain pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -start-32 top-0 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(184,149,106,0.08),transparent_68%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="cb-eyebrow mb-6">{eyebrow}</p>
            <div className="cb-accent-line mb-8" aria-hidden />
            <h1 id="cb-hero-title" className="cb-headline max-w-[12ch]">
              {title}
            </h1>
            <p className="cb-body mt-8 max-w-[34rem] text-[1.0625rem] leading-[1.8] sm:text-[1.125rem]">
              {subtitle}
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              <a href="#contact" className="cb-btn-primary cb-focus-ring">
                {primaryCta}
              </a>
              <a href="#features" className="cb-btn-secondary cb-focus-ring">
                {secondaryCta}
              </a>
            </div>

            <div className="mt-16 border-t border-[var(--border-subtle)] pt-8">
              <p className="cb-font-body mb-5 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Advising leaders at
              </p>
              <div className="cb-trust-fade relative overflow-hidden" aria-label="Trusted by leading organizations">
                <div className="cb-marquee-track flex w-max gap-12">
                  {[...TRUST_BRANDS, ...TRUST_BRANDS].map((brand, i) => (
                    <span key={`${brand}-${i}`} className="cb-trust-logo whitespace-nowrap">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative lg:ps-4">
              <div
                className="absolute -end-3 -top-3 hidden h-[calc(100%-1rem)] w-[calc(100%-1rem)] border border-[var(--border-accent)]/60 lg:block"
                aria-hidden
              />
              <div className="relative overflow-hidden border border-[var(--border-subtle)] bg-[var(--color-surface)] shadow-[var(--shadow-surface)]">
                <SlotImage
                  slot="hero"
                  index={0}
                  preferred={imageUrl}
                  alt="Executive leadership team in a strategy session at a global headquarters"
                  className="aspect-[4/5] w-full object-cover object-[center_20%] sm:aspect-[5/6]"
                  priority
                />
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-px border border-[var(--border-subtle)] bg-[var(--border-subtle)]">
              {metrics.map((metric) => (
                <div key={metric.label} className="bg-[var(--color-surface)] px-5 py-5 sm:px-6 sm:py-6">
                  <dt className="cb-metric text-[clamp(1.5rem,2.5vw,2rem)]">{metric.value}</dt>
                  <dd className="cb-font-body mt-2 text-[0.75rem] leading-snug text-[var(--color-muted)]">
                    {metric.label}
                  </dd>
                  {metric.trend ? (
                    <dd className="cb-font-mono mt-1 text-[0.625rem] uppercase tracking-[0.1em] text-[var(--color-signal)]">
                      {metric.trend}
                    </dd>
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
