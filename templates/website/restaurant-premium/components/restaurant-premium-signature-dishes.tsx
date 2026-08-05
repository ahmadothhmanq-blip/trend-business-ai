"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type Dish = {
  name: string;
  description: string;
  imageIndex?: number;
};

const DEFAULT_DISHES: Dish[] = [
  {
    name: "Ember-roasted duck",
    description: "Black garlic, sour cherry, smoked potato purée",
    imageIndex: 0,
  },
  {
    name: "Hand-dived scallop",
    description: "Cucumber granite, yuzu, crispy rice",
    imageIndex: 1,
  },
  {
    name: "Wild mushroom tart",
    description: "Truffle cream, aged comté, herb salad",
    imageIndex: 2,
  },
];

type RestaurantPremiumSignatureDishesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Dish[];
};

export function RestaurantPremiumSignatureDishes({
  eyebrow = "Signatures",
  title = "Plates that define the evening",
  subtitle = "Three compositions returned to each season — refined, never repeated exactly.",
  items = DEFAULT_DISHES,
}: RestaurantPremiumSignatureDishesProps) {
  return (
    <section
      id="signatures"
      data-v2-component="restaurant-premium-signature-dishes"
      aria-labelledby="rp-dishes-title"
      className="rp-section rp-section-alt"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <header className="mb-16 max-w-xl">
          <p className="rp-eyebrow mb-5">{eyebrow}</p>
          <h2 id="rp-dishes-title" className="rp-headline text-[clamp(2rem,4vw,3rem)]">
            {title}
          </h2>
          <div className="rp-copper-rule my-6" />
          <p className="rp-body">{subtitle}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 md:gap-5">
          {items.map((dish, index) => (
            <article key={`signature-${dish.name}`} className="rp-card group relative overflow-hidden">
              <figure className="relative aspect-[3/4] overflow-hidden">
                <SlotImage
                  slot="products"
                  index={dish.imageIndex ?? index}
                  alt={dish.name}
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
                <figcaption className="absolute inset-x-0 bottom-0 p-7">
                  <span className="rp-font-body text-[0.625rem] uppercase tracking-[0.28em] text-[var(--color-copper)]">
                    No. {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="rp-font-display mt-2 text-2xl text-[var(--color-foreground)]">
                    {dish.name}
                  </h3>
                  <p className="rp-font-body mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {dish.description}
                  </p>
                </figcaption>
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
