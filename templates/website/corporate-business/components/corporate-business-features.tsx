"use client";

const CAPABILITIES = [
  { title: "Corporate strategy", description: "Portfolio choices, growth architecture, and competitive positioning for global enterprises.", icon: "01" },
  { title: "Operating model", description: "Cost transformation, process redesign, and shared services that scale across regions.", icon: "02" },
  { title: "Digital & AI", description: "Technology roadmaps, data platforms, and AI adoption with measurable P&L impact.", icon: "03" },
  { title: "Change & culture", description: "Leadership alignment, capability building, and adoption programs that stick.", icon: "04" },
];

export function CorporateBusinessFeatures() {
  return (
    <section id="features" data-v2-component="corporate-business-features" aria-labelledby="cb-features-title" className="df-reveal cb-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 max-w-2xl border-s-4 border-[var(--color-accent)] ps-6">
          <p className="cb-eyebrow">Capabilities</p>
          <h2 id="cb-features-title" className="cb-headline-sm mt-3">From boardroom strategy to frontline execution</h2>
          <p className="cb-body mt-4 text-[var(--color-muted)]">Integrated teams — strategists, operators, and technologists — accountable for outcomes.</p>
        </header>
        <ul className="divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
          {CAPABILITIES.map((item) => (
            <li key={item.title} className="df-reveal-stagger grid gap-6 py-10 lg:grid-cols-[4rem_1fr] lg:items-start">
              <span className="cb-font-display text-3xl font-light text-[var(--color-accent)]">{item.icon}</span>
              <div className="min-w-0">
                <h3 className="cb-font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
