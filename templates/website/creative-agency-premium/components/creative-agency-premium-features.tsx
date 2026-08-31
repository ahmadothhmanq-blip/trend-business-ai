"use client";

const SERVICES = [
  {
    num: "01",
    title: "Brand identity",
    body: "Visual systems, verbal identity, and design languages engineered to scale across markets and touchpoints.",
  },
  {
    num: "02",
    title: "Product design",
    body: "Interfaces, design systems, and prototypes — from discovery through production-ready handoff.",
  },
  {
    num: "03",
    title: "Campaign & motion",
    body: "Launch narratives, film, and motion systems that translate strategy into culture.",
  },
  {
    num: "04",
    title: "Creative direction",
    body: "Positioning, audience insight, and ongoing leadership for teams building category-defining brands.",
  },
];

type CreativeAgencyPremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  items?: Array<{ num: string; title: string; body: string }>;
};

export function CreativeAgencyPremiumFeatures({
  eyebrow = "Services",
  title = "What we do",
  items = SERVICES,
}: CreativeAgencyPremiumFeaturesProps) {
  return (
    <section id="features" data-v2-component="creative-agency-premium-features" className="df-reveal border-t border-[var(--border-default)] py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="sv-font-mono text-[0.6875rem] tracking-[0.22em] text-[var(--color-volt)]">{eyebrow}</p>
            <h2 className="sv-font-display mt-3 text-3xl font-semibold text-[var(--color-ghost)] [text-transform:none]">{title}</h2>
          </div>
          <a href="#contact" className="sv-font-mono text-xs tracking-widest text-[var(--color-volt)] hover:underline">
            Discuss a project →
          </a>
        </div>

        <ul className="mt-14 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
          {items.map((item) => (
            <li key={item.num} className="df-reveal-stagger group grid gap-6 py-10 sm:grid-cols-[5rem_1fr] sm:gap-10">
              <span className="sv-font-mono text-sm text-[var(--color-volt)]">{item.num}</span>
              <div>
                <h3 className="sv-font-display text-2xl font-semibold text-[var(--color-ghost)] transition group-hover:text-[var(--color-volt)] [text-transform:none]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
