"use client";

const ENGAGEMENTS = [
  { name: "Diagnostic", fee: "4–6 weeks", desc: "Rapid assessment with prioritized roadmap and business case.", points: ["Executive interviews", "Benchmark analysis", "Investment thesis"], cta: "Start diagnostic", featured: false },
  { name: "Transformation", fee: "6–18 months", desc: "End-to-end program with embedded teams and outcome tracking.", points: ["Dedicated partner", "Cross-functional squads", "Quarterly value gates"], cta: "Discuss program", featured: true },
  { name: "Managed advisory", fee: "Retainer", desc: "Ongoing counsel for portfolio companies and executive committees.", points: ["Monthly steering", "Pipeline support", "Board preparation"], cta: "Explore retainer", featured: false },
];

export function CorporateBusinessPricing() {
  return (
    <section id="pricing" data-v2-component="corporate-business-pricing" aria-labelledby="cb-pricing-title" className="df-reveal cb-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="cb-eyebrow">Engagements</p>
          <h2 id="cb-pricing-title" className="cb-headline-sm mt-2">How we partner</h2>
        </header>
        <div className="df-reveal-stagger grid gap-6 lg:grid-cols-3">
          {ENGAGEMENTS.map((tier) => (
            <article key={tier.name} className={`flex flex-col border p-8 ${tier.featured ? "border-[var(--color-accent)] bg-[var(--color-background)] shadow-[var(--shadow-card)]" : "border-[var(--border-default)]"}`}>
              <h3 className="cb-font-display text-xl font-semibold">{tier.name}</h3>
              <p className="mt-2 text-lg text-[var(--color-accent)]">{tier.fee}</p>
              <p className="mt-4 text-sm text-[var(--color-muted)]">{tier.desc}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--color-muted)]">{tier.points.map((p) => <li key={p}>— {p}</li>)}</ul>
              <a href="#contact" className={`${tier.featured ? "cb-btn-primary" : "cb-btn-secondary"} cb-focus-ring mt-8 w-fit`}>{tier.cta}</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
