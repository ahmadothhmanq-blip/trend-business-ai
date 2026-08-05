"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const PILLARS = [
  { title: "Fire", body: "Live ember cooking over seasonal hardwood — technique as ritual." },
  { title: "Forage", body: "Ingredients gathered within forty miles, composed at peak expression." },
  { title: "Terroir", body: "Wine pairings drawn from small producers who share our philosophy." },
];

type RestaurantPremiumChefStoryProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RestaurantPremiumChefStory({
  eyebrow = "The kitchen",
  title = "A philosophy written in flame",
  subtitle = "Chef Élise Marche trained under the great kitchens of Lyon before returning to compose a cuisine of restraint — where each course reveals a single idea, fully realized.",
}: RestaurantPremiumChefStoryProps) {
  return (
    <section
      id="chef"
      data-v2-component="restaurant-premium-chef-story"
      aria-labelledby="rp-chef-title"
      className="rp-section"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <figure className="rp-card relative aspect-[4/5] overflow-hidden">
              <SlotImage
                slot="about"
                index={0}
                alt="Executive chef finishing a course at the pass"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-[var(--border-subtle)]" aria-hidden />
            </figure>
            <div
              className="absolute -bottom-6 -end-6 hidden h-32 w-32 border border-[var(--border-copper)] bg-[var(--color-background)]/90 p-4 backdrop-blur-sm lg:block"
              aria-hidden
            >
              <p className="rp-font-display text-center text-3xl text-[var(--color-copper)]">★</p>
              <p className="rp-font-body mt-1 text-center text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                Michelin
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="rp-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rp-chef-title" className="rp-headline text-[clamp(2rem,4vw,3.25rem)]">
              {title}
            </h2>
            <div className="rp-copper-rule my-6" />
            <p className="rp-body text-muted-foreground max-w-lg">{subtitle}</p>
          </div>
        </div>

        <div className="mt-20 grid gap-px border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="bg-[var(--color-background)] p-8 transition-colors hover:bg-[color-mix(in_srgb,var(--color-copper)_4%,var(--color-background))] lg:p-10"
            >
              <h3 className="rp-font-display text-2xl text-[var(--color-copper)]">{pillar.title}</h3>
              <p className="rp-font-body mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
