"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

const PILLARS = [
  { title: "Fire", body: "Live ember cooking over seasonal hardwood — technique as ritual." },
  { title: "Forage", body: "Ingredients gathered within forty miles, composed at peak expression." },
  { title: "Terroir", body: "Wine pairings drawn from small producers who share our philosophy." },
];

type RestaurantSignatureChefStoryProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RestaurantSignatureChefStory({
  eyebrow = "The kitchen",
  title = "A philosophy written in flame",
  subtitle = "Chef Élise Marche trained under the great kitchens of Lyon before returning to compose a cuisine of restraint — where each course reveals a single idea, fully realized.",
}: RestaurantSignatureChefStoryProps) {
  const portrait = resolveSlotImage("about", 1);

  return (
    <section
      id="chef"
      data-v2-component="restaurant-signature-chef-story"
      aria-labelledby="rs-chef-title"
      className="rs-section"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <figure className="relative aspect-[4/5] overflow-hidden">
              {portrait ? (
                <img
                  src={portrait}
                  alt="Chef at work in the kitchen"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(145deg, var(--color-primary), var(--color-surface))",
                  }}
                />
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-[var(--border-subtle)]" />
            </figure>
            <div
              className="absolute -bottom-6 -end-6 hidden h-32 w-32 border border-[var(--border-copper)] bg-[var(--color-background)]/80 p-4 lg:block"
              aria-hidden
            >
              <p className="rs-font-display text-center text-3xl text-[var(--color-copper)]">★</p>
              <p className="rs-font-body mt-1 text-center text-[0.625rem] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                Michelin
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="rs-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rs-chef-title" className="rs-headline text-[clamp(2rem,4vw,3.25rem)]">
              {title}
            </h2>
            <div className="rs-copper-rule my-6" />
            <p className="rs-body max-w-lg">{subtitle}</p>
          </div>
        </div>

        <div className="mt-20 grid gap-px border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="bg-[var(--color-background)] p-8 lg:p-10"
            >
              <h3 className="rs-font-display text-2xl text-[var(--color-copper)]">{pillar.title}</h3>
              <p className="rs-font-body mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
