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

type RestaurantSignatureTastingMenuProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: MenuCourse[];
};

export function RestaurantSignatureTastingMenu({
  eyebrow = "Seasonal tasting",
  title = "Seven courses of quiet revelation",
  subtitle = "Our menu evolves with the forest floor. Each evening is composed anew.",
  items = DEFAULT_COURSES,
}: RestaurantSignatureTastingMenuProps) {
  return (
    <section
      id="menu"
      data-v2-component="restaurant-signature-tasting-menu"
      aria-labelledby="rs-menu-title"
      className="rs-section bg-[var(--color-surface)]/30"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <header className="max-w-2xl">
          <p className="rs-eyebrow mb-5">{eyebrow}</p>
          <h2 id="rs-menu-title" className="rs-headline text-[clamp(2rem,4vw,3.25rem)]">
            {title}
          </h2>
          <div className="rs-copper-rule my-6" />
          <p className="rs-body">{subtitle}</p>
          <p className="rs-font-body mt-6 text-sm text-[var(--color-copper)]">
            Tasting menu · $185 per guest · Wine pairing +$95
          </p>
        </header>

        <ol className="mt-16 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {items.map((item, index) => (
            <li
              key={`${item.course}-${item.name}`}
              className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-8"
            >
              <span
                className="rs-font-display text-3xl text-[var(--color-copper)]/80"
                aria-hidden
              >
                {item.course}
              </span>
              <div>
                <h3 className="rs-font-display text-xl text-[var(--color-foreground)] sm:text-2xl">
                  {item.name}
                </h3>
                <p className="rs-font-body mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.description}
                </p>
              </div>
              {item.pairing ? (
                <p className="rs-font-body text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-copper)]/70 sm:text-end">
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
