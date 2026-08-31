"use client";

const TRUST_PILLARS = [
  { label: "Regulatory alignment", detail: "SEC, FCA, and cross-border compliance frameworks" },
  { label: "Fiduciary standard", detail: "Institutional-grade governance on every mandate" },
  { label: "Global coverage", detail: "Advisory desks across major financial centers" },
  { label: "Risk discipline", detail: "Scenario modeling and portfolio stress testing" },
];

const CREDENTIALS = ["CFA", "CPA", "CIMA", "CFP"];

const MARKET_STRIP = [
  { label: "Global AUM", value: "$48B" },
  { label: "Client retention", value: "97%" },
  { label: "Financial centers", value: "28" },
];

type FinancePremiumHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function FinancePremiumHero({
  title = "Institutional strength for modern markets",
  subtitle = "Portfolio strategy, risk governance, and wealth architecture for families and institutions operating across borders.",
  eyebrow = "Global capital advisory",
  primaryCta = "Speak with an advisor",
  secondaryCta = "Our approach",
  imageUrl = null,
}: FinancePremiumHeroProps) {
  return (
    <section id="top" data-v2-component="finance-premium-hero" aria-labelledby="fn-hero-title" className="relative overflow-hidden border-b border-[var(--border-default)] bg-[var(--color-background)]">
      <div className="pointer-events-none absolute inset-y-0 end-0 w-2/5 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-accent)_8%,transparent),transparent_70%)]" aria-hidden />
      <div className="relative mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="df-hero-stagger lg:col-span-6 motion-safe:animate-[fade-up_0.65s_ease_both]">
            <p className="fn-eyebrow mb-5 text-[var(--color-accent)]">{eyebrow}</p>
            <h1 id="fn-hero-title" className="fn-font-display max-w-[14ch] text-balance text-[clamp(2.5rem,4.5vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--color-foreground)]">
              {title}
            </h1>
            <p className="fn-font-body mt-7 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#contact" className="fn-btn-primary fn-focus-ring">{primaryCta}</a>
              <a href="#about" className="fn-btn-secondary fn-focus-ring">{secondaryCta}</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {CREDENTIALS.map((badge) => (
                <span key={badge} className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] px-3 py-1.5 fn-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 motion-safe:animate-[fade-up_0.7s_ease_0.1s_both]">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
              <p className="fn-font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-accent)]">Institutional trust</p>
              <ul className="mt-6 space-y-5">
                {TRUST_PILLARS.map((pillar, index) => (
                  <li key={pillar.label} className="border-b border-[var(--border-subtle)] pb-5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <span className="fn-font-mono mt-0.5 shrink-0 text-xs text-[var(--color-accent)]">{String(index + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <p className="fn-font-display text-lg font-semibold text-[var(--color-foreground)]">{pillar.label}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{pillar.detail}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <dl className="mt-14 grid gap-px border border-[var(--border-default)] bg-[var(--border-default)] sm:grid-cols-3">
          {MARKET_STRIP.map((item) => (
            <div key={item.label} className="bg-[var(--color-surface)] px-6 py-5 text-center sm:text-start">
              <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{item.label}</dt>
              <dd className="fn-metric mt-1 text-2xl">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {imageUrl ? <img src={imageUrl} alt="" className="sr-only" aria-hidden /> : null}
    </section>
  );
}
