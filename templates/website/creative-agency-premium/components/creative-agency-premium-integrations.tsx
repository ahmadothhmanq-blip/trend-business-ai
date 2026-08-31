"use client";

const DISCIPLINES = [
  { title: "Brand strategy", detail: "Positioning, narrative, and category design" },
  { title: "Visual identity", detail: "Systems that scale across markets and touchpoints" },
  { title: "Product design", detail: "Interfaces, flows, and design systems" },
  { title: "Motion design", detail: "Film, launch assets, and kinetic systems" },
  { title: "Art direction", detail: "Campaign craft and creative leadership" },
  { title: "Design ops", detail: "Tooling, governance, and team enablement" },
];

export function CreativeAgencyPremiumIntegrations() {
  return (
    <section id="integrations" data-v2-component="creative-agency-premium-integrations" aria-labelledby="sv-capabilities-title" className="df-reveal border-t border-[var(--border-default)] py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <header className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="sv-font-mono text-[0.6875rem] tracking-[0.22em] text-[var(--color-volt)]">Capabilities</p>
            <h2 id="sv-capabilities-title" className="sv-font-display mt-3 text-3xl font-semibold text-[var(--color-ghost)] [text-transform:none]">
              End-to-end creative leadership
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
              Strategy through execution — one studio team accountable for how your brand shows up in market.
            </p>
          </div>
          <a href="#contact" className="sv-font-mono text-xs tracking-widest text-[var(--color-volt)] hover:underline">
            Scope a project →
          </a>
        </header>
        <div className="df-reveal-stagger grid gap-px bg-[var(--border-default)] sm:grid-cols-2 lg:grid-cols-3">
          {DISCIPLINES.map((item, i) => (
            <article key={item.title} className="group bg-[var(--color-background)] p-7 transition-colors hover:bg-[var(--color-surface)]">
              <span className="sv-font-mono text-xs text-[var(--color-volt)]">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="sv-font-display mt-4 text-lg font-semibold text-[var(--color-ghost)] [text-transform:none]">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
