"use client";

const PROGRAMS = [
  {
    name: "Private wealth",
    fee: "From 0.65%",
    desc: "For families and principals with complex cross-border holdings.",
    points: ["Dedicated partner team", "Tax-aware allocation", "Quarterly governance reviews"],
    cta: "Discuss your portfolio",
    featured: false,
  },
  {
    name: "Institutional",
    fee: "Custom mandate",
    desc: "Endowments, foundations, and pension programs requiring IPS discipline.",
    points: ["Board-ready reporting", "Liquidity planning", "Manager selection & oversight"],
    cta: "Request a proposal",
    featured: true,
  },
  {
    name: "Family office",
    fee: "Retainer + AUM",
    desc: "Embedded advisory for single and multi-family offices.",
    points: ["CIO-level counsel", "Consolidated reporting", "Next-gen education"],
    cta: "Schedule introduction",
    featured: false,
  },
];

export function FinancePremiumPricing() {
  return (
    <section id="pricing" data-v2-component="finance-premium-pricing" aria-labelledby="fn-pricing-title" className="df-reveal fn-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="fn-eyebrow">Advisory programs</p>
          <h2 id="fn-pricing-title" className="fn-headline-sm mt-2">Engagement models</h2>
          <p className="fn-body mt-4 text-[var(--color-muted)]">Transparent fee structures aligned with fiduciary duty — no hidden product commissions.</p>
        </header>
        <div className="df-reveal-stagger grid gap-6 lg:grid-cols-3">
          {PROGRAMS.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col border p-8 ${tier.featured ? "border-[var(--color-accent)] bg-[var(--color-background)] shadow-[var(--shadow-card)]" : "border-[var(--border-default)] bg-transparent"}`}
            >
              <h3 className="fn-font-display text-xl font-semibold">{tier.name}</h3>
              <p className="mt-2 fn-metric text-2xl text-[var(--color-accent)]">{tier.fee}</p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">{tier.desc}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--color-muted)]">
                {tier.points.map((p) => (
                  <li key={p}>— {p}</li>
                ))}
              </ul>
              <a href="#contact" className={`${tier.featured ? "fn-btn-primary" : "fn-btn-secondary"} fn-focus-ring mt-8 w-fit`}>
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
