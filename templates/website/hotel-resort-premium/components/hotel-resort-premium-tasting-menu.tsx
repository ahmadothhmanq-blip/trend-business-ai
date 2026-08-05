"use client";

type Experience = {
  course: string;
  name: string;
  description: string;
  pairing?: string;
};

const DEFAULT_EXPERIENCES: Experience[] = [
  {
    course: "I",
    name: "Ocean spa ritual",
    description: "Mineral soak, reef-salt exfoliation, warm stone massage",
    pairing: "90 minutes · Private pavilion",
  },
  {
    course: "II",
    name: "Sunrise yacht charter",
    description: "Private vessel, reef snorkel, champagne breakfast",
    pairing: "Half-day · Captain included",
  },
  {
    course: "III",
    name: "Chef's table dining",
    description: "Seven-course tasting menu with ocean-view kitchen",
    pairing: "Michelin-starred · Nightly",
  },
  {
    course: "IV",
    name: "Coastal forest trek",
    description: "Guided botanical walk, cliffside viewpoints, picnic",
  },
  {
    course: "V",
    name: "Evening turndown",
    description: "Aromatherapy ritual, artisan chocolates, horizon playlist",
    pairing: "Nightly · All villas",
  },
];

type HotelResortPremiumTastingMenuProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Experience[];
};

export function HotelResortPremiumTastingMenu({
  eyebrow = "Curated experiences",
  title = "Five rituals of coastal living",
  subtitle = "Our experience calendar evolves with the tides. Each stay is composed anew around your rhythm.",
  items = DEFAULT_EXPERIENCES,
}: HotelResortPremiumTastingMenuProps) {
  return (
    <section
      id="experiences"
      data-v2-component="hotel-resort-premium-tasting-menu"
      aria-labelledby="hr-menu-title"
      className="hr-section hr-section-alt"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <header className="max-w-2xl">
          <p className="hr-eyebrow mb-5">{eyebrow}</p>
          <h2 id="hr-menu-title" className="hr-headline text-[clamp(2rem,4vw,3.25rem)]">
            {title}
          </h2>
          <div className="hr-azure-rule my-6" />
          <p className="hr-body">{subtitle}</p>
          <p className="hr-font-body mt-6 inline-flex items-center gap-3 text-sm text-[var(--color-azure)]">
            <span className="h-px w-8 bg-[var(--color-azure)]/50" aria-hidden />
            Concierge-composed itineraries · Tailored to your stay
          </p>
        </header>

        <ol className="mt-16 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {items.map((item) => (
            <li
              key={`${item.course}-${item.name}`}
              className="group grid gap-4 py-9 transition-colors hover:bg-[color-mix(in_srgb,var(--color-azure)_4%,transparent)] sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-8 sm:px-4"
            >
              <span
                className="hr-font-display text-3xl text-[var(--color-azure)]/70 transition-colors group-hover:text-[var(--color-azure)]"
                aria-hidden
              >
                {item.course}
              </span>
              <div>
                <h3 className="hr-font-display text-xl text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-azure)] sm:text-2xl">
                  {item.name}
                </h3>
                <p className="hr-font-body mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.description}
                </p>
              </div>
              {item.pairing ? (
                <p className="hr-font-body text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-azure)]/60 transition-colors group-hover:text-[var(--color-azure)] sm:text-end">
                  {item.pairing}
                </p>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
