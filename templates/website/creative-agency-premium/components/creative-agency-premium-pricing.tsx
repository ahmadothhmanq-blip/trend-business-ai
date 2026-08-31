"use client";

const TIERS = [
  {
    name: "Project",
    price: "From $48k",
    desc: "Fixed scope for rebrands, launches, and product initiatives.",
    points: ["4–12 week timeline", "Dedicated director", "Strategy to handoff"],
    cta: "Scope a project",
    featured: false,
  },
  {
    name: "Retainer",
    price: "From $12k/mo",
    desc: "Embedded design capacity for teams shipping continuously.",
    points: ["Monthly sprint cycles", "Flexible scope", "Design ops support"],
    cta: "Discuss retainer",
    featured: false,
  },
  {
    name: "Partnership",
    price: "From $18k/mo",
    desc: "Creative leadership for ongoing global brand and product programs.",
    points: ["Priority capacity", "Quarterly planning", "Multi-market support"],
    cta: "Book a call",
    featured: true,
  },
];

export function CreativeAgencyPremiumPricing() {
  return (
    <section id="pricing" data-v2-component="creative-agency-premium-pricing" aria-labelledby="sv-pricing-title" className="df-reveal bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <p className="sv-font-mono text-[0.6875rem] tracking-[0.22em] text-[var(--color-volt)]">ENGAGEMENT</p>
        <h2 id="sv-pricing-title" className="sv-font-display mt-3 text-3xl font-semibold text-[var(--color-ghost)] [text-transform:none]">How we work</h2>

        <div className="df-reveal-stagger mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((t) => (
            <article
              key={t.name}
              className={`flex flex-col border p-8 sm:p-10 ${t.featured ? "border-[var(--color-volt)] bg-[var(--color-background)]" : "border-[var(--border-default)] bg-transparent"}`}
            >
              <h3 className="sv-font-display text-2xl font-semibold text-[var(--color-ghost)] [text-transform:none]">{t.name}</h3>
              <p className="mt-2 text-xl text-[var(--color-volt)]">{t.price}</p>
              <p className="mt-4 text-sm text-[var(--color-muted)]">{t.desc}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--color-muted)]">
                {t.points.map((p) => (
                  <li key={p}>— {p}</li>
                ))}
              </ul>
              <a href="#contact" className={`${t.featured ? "sv-btn-volt" : "sv-btn-ghost"} sv-focus-ring mt-8 w-fit`}>
                {t.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
