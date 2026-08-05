"use client";

type MenuCourse = {
  course: string;
  name: string;
  description: string;
  pairing?: string;
};

const DEFAULT_COURSES: MenuCourse[] = [
  {
    course: "I",
    name: "Amuse — Forest broth",
    description: "Wild mushroom essence, pine oil, crisp shallot",
    pairing: "Champagne · NV",
  },
  {
    course: "II",
    name: "Raw — Scallop",
    description: "Cucumber, green apple, smoked salt",
    pairing: "Muscadet · 2022",
  },
  {
    course: "III",
    name: "Fire — Venison",
    description: "Juniper, beet, ember jus",
    pairing: "Pinot Noir · Willamette",
  },
  {
    course: "IV",
    name: "Garden — Heritage carrots",
    description: "Fermented cashew, herb oil",
  },
  {
    course: "V",
    name: "Sweet — Dark chocolate",
    description: "Smoked cream, hazelnut, gold leaf",
    pairing: "Banyuls · 2018",
  },
];

type RestaurantPremiumTastingMenuProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: MenuCourse[];
};

export function RestaurantPremiumTastingMenu({
  eyebrow = "Seasonal tasting",
  title = "Seven courses of quiet revelation",
  subtitle = "Our menu evolves with the forest floor. Each evening is composed anew.",
  items = DEFAULT_COURSES,
}: RestaurantPremiumTastingMenuProps) {
  return (
    <section
      id="menu"
      data-v2-component="restaurant-premium-tasting-menu"
      aria-labelledby="rp-menu-title"
      className="rp-section rp-section-alt"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <header className="max-w-2xl">
          <p className="rp-eyebrow mb-5">{eyebrow}</p>
          <h2 id="rp-menu-title" className="rp-headline text-[clamp(2rem,4vw,3.25rem)]">
            {title}
          </h2>
          <div className="rp-copper-rule my-6" />
          <p className="rp-body">{subtitle}</p>
          <p className="rp-font-body mt-6 inline-flex items-center gap-3 text-sm text-[var(--color-copper)]">
            <span className="h-px w-8 bg-[var(--color-copper)]/50" aria-hidden />
            Tasting menu · $185 per guest · Wine pairing +$95
          </p>
        </header>

        <ol className="mt-16 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {items.map((item) => (
            <li
              key={`${item.course}-${item.name}`}
              className="group grid gap-4 py-9 transition-colors hover:bg-[color-mix(in_srgb,var(--color-copper)_4%,transparent)] sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-8 sm:px-4"
            >
              <span
                className="rp-font-display text-3xl text-[var(--color-copper)]/70 transition-colors group-hover:text-[var(--color-copper)]"
                aria-hidden
              >
                {item.course}
              </span>
              <div>
                <h3 className="rp-font-display text-xl text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-copper)] sm:text-2xl">
                  {item.name}
                </h3>
                <p className="rp-font-body mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.description}
                </p>
              </div>
              {item.pairing ? (
                <p className="rp-font-body text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-copper)]/60 transition-colors group-hover:text-[var(--color-copper)] sm:text-end">
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
