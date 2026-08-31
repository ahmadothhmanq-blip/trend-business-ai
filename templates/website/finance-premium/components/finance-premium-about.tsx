"use client";

const HIGHLIGHTS = [
  "Founded in 1987 — four decades of fiduciary counsel",
  "Serving family offices, endowments, and sovereign institutions",
  "Independent advice with no proprietary product conflicts",
];

type FinancePremiumAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function FinancePremiumAbout({
  eyebrow = "The firm",
  title = "Capital stewardship across generations",
  subtitle = "Independent advisory for those who measure success in decades, not quarters.",
  body = "Ledger was built on a single principle: institutional discipline should be accessible to families and organizations navigating complex global markets. Our partners combine portfolio construction, tax-aware planning, and governance — without the conflicts of a balance-sheet bank.",
  imageUrl = null,
  highlights = HIGHLIGHTS,
  primaryCta = "Meet our partners",
}: FinancePremiumAboutProps) {
  return (
    <section id="about" data-v2-component="finance-premium-about" aria-labelledby="fn-about-title" className="df-reveal fn-section py-20 sm:py-28">
      <div className="df-reveal-stagger mx-auto grid max-w-[82rem] items-center gap-12 px-5 lg:grid-cols-2 sm:px-8">
        <div className="min-w-0">
          <p className="fn-eyebrow">{eyebrow}</p>
          <h2 id="fn-about-title" className="fn-headline-sm mt-3 text-balance">{title}</h2>
          <p className="fn-body mt-4 text-[var(--color-muted)]">{subtitle}</p>
          <p className="fn-body mt-6 leading-relaxed">{body}</p>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex gap-3 text-sm">
                <span className="shrink-0 text-[var(--color-accent)]" aria-hidden>—</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
          <a href="#contact" className="fn-btn-primary fn-focus-ring mt-10 inline-flex">{primaryCta}</a>
        </div>
        <div className="relative min-h-[18rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-primary)] p-8 text-white lg:min-h-[24rem]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,color-mix(in_srgb,var(--color-accent)_25%,transparent),transparent)]" aria-hidden />
          <div className="relative">
            <p className="fn-font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-accent)]">Since 1987</p>
            <p className="fn-font-display mt-6 text-4xl font-semibold leading-none">40+</p>
            <p className="mt-2 text-sm text-white/70">Years advising across market cycles</p>
            <div className="mt-10 space-y-4 border-t border-white/15 pt-8 text-sm text-white/80">
              <p>New York · London · Singapore · Zurich</p>
              <p>SEC Registered · FCA Authorized</p>
            </div>
          </div>
          {imageUrl ? <img src={imageUrl} alt="" className="sr-only" aria-hidden /> : null}
        </div>
      </div>
    </section>
  );
}
