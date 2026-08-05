"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

type Dish = {
  name: string;
  description: string;
  imageIndex?: number;
};

const DEFAULT_DISHES: Dish[] = [
  {
    name: "Ember-roasted duck",
    description: "Black garlic, sour cherry, smoked potato purée",
    imageIndex: 2,
  },
  {
    name: "Hand-dived scallop",
    description: "Cucumber granite, yuzu, crispy rice",
    imageIndex: 3,
  },
  {
    name: "Wild mushroom tart",
    description: "Truffle cream, aged comté, herb salad",
    imageIndex: 4,
  },
];

type RestaurantSignatureSignatureDishesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Dish[];
};

export function RestaurantSignatureSignatureDishes({
  eyebrow = "Signatures",
  title = "Plates that define the evening",
  subtitle = "Three compositions returned to each season — refined, never repeated exactly.",
  items = DEFAULT_DISHES,
}: RestaurantSignatureSignatureDishesProps) {
  return (
    <section
      id="signatures"
      data-v2-component="restaurant-signature-signature-dishes"
      aria-labelledby="rs-dishes-title"
      className="rs-section"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <header className="mb-16 max-w-xl">
          <p className="rs-eyebrow mb-5">{eyebrow}</p>
          <h2 id="rs-dishes-title" className="rs-headline text-[clamp(2rem,4vw,3rem)]">
            {title}
          </h2>
          <div className="rs-copper-rule my-6" />
          <p className="rs-body">{subtitle}</p>
        </header>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {items.map((dish, index) => {
            const src = resolveSlotImage("about", dish.imageIndex ?? index + 2);
            return (
              <article
                key={dish.name}
                className="group relative flex flex-col"
              >
                <figure className="relative aspect-[3/4] overflow-hidden">
                  {src ? (
                    <img
                      src={src}
                      alt={dish.name}
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(160deg, var(--color-surface), var(--color-primary))`,
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)]/90 via-transparent to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="rs-font-display text-2xl text-[var(--color-foreground)]">
                      {dish.name}
                    </h3>
                    <p className="rs-font-body mt-2 text-sm text-[var(--color-muted)]">
                      {dish.description}
                    </p>
                  </figcaption>
                </figure>
                <div className="mt-4 h-px w-12 bg-[var(--color-copper)] transition-all duration-500 group-hover:w-full" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
