"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const FEATURED = [
  {
    id: "01",
    title: "Monolith Residences",
    category: "Architecture · Brand",
    year: "2025",
    imageIndex: 0,
  },
  {
    id: "02",
    title: "Pulse Festival",
    category: "Motion · Experience",
    year: "2025",
    imageIndex: 1,
  },
  {
    id: "03",
    title: "Forma Type Foundry",
    category: "Identity · Digital",
    year: "2024",
    imageIndex: 2,
  },
];

type CreativeAgencyPremiumSelectedWorkProps = {
  eyebrow?: string;
  title?: string;
};

export function CreativeAgencyPremiumSelectedWork({
  eyebrow = "Selected work",
  title = "Portfolio that moves culture",
}: CreativeAgencyPremiumSelectedWorkProps) {
  return (
    <section
      id="work"
      data-v2-component="creative-agency-premium-selected-work"
      aria-labelledby="sv-work-title"
      className="sv-section border-b border-[var(--border-subtle)]"
    >
      <div className="px-5 sm:px-8">
        <header className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="sv-eyebrow">{eyebrow}</p>
            <h2 id="sv-work-title" className="sv-headline mt-5 max-w-xl">
              {title}
            </h2>
          </div>
          <a href="/work" className="sv-link-volt sv-font-mono text-xs uppercase tracking-widest">
            All projects →
          </a>
        </header>

        <ul className="space-y-0">
          {FEATURED.map((item, i) => (
            <li key={item.id} className="border-t border-[var(--border-default)] last:border-b">
              <a
                href={`#case-${item.id}`}
                className="sv-case-row group grid gap-6 py-10 transition-colors hover:bg-[var(--color-surface)]/60 lg:grid-cols-[5rem_1fr_14rem_5rem] lg:items-center lg:gap-10 lg:py-12"
              >
                <span className="sv-font-mono sv-index-num text-3xl font-bold text-[var(--color-surface)] transition group-hover:text-[var(--color-volt)] lg:text-4xl">
                  {item.id}
                </span>
                <div>
                  <h3 className="sv-font-display text-2xl font-bold uppercase tracking-tight transition group-hover:text-[var(--color-volt)] lg:text-[2.25rem]">
                    {item.title}
                  </h3>
                  <p className="sv-font-mono mt-2 text-xs uppercase tracking-widest text-[var(--color-zinc)] opacity-70">
                    {item.category}
                  </p>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden border border-[var(--border-default)] transition group-hover:border-[var(--border-volt)] lg:aspect-[4/3]">
                  <SlotImage
                    slot="gallery"
                    index={item.imageIndex}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-[var(--color-volt)]/0 transition group-hover:bg-[var(--color-volt)]/10" />
                </div>
                <span className="sv-font-mono sv-index-num text-end text-sm text-[var(--color-muted)] opacity-70">
                  {item.year}
                </span>
                <span className="sv-font-mono hidden text-[var(--color-volt)] lg:col-span-4 lg:block" aria-hidden>
                  {i < FEATURED.length - 1 ? "—" : "✦"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
