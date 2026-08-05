"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type RestaurantPremiumAtmosphereProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RestaurantPremiumAtmosphere({
  eyebrow = "The room",
  title = "Candlelit intimacy",
  subtitle = "Twelve tables beneath vaulted timber and soft copper light. The room breathes with the rhythm of service — unhurried, attentive, present.",
}: RestaurantPremiumAtmosphereProps) {
  return (
    <section
      id="atmosphere"
      data-v2-component="restaurant-premium-atmosphere"
      aria-labelledby="rp-atmosphere-title"
      className="rp-section overflow-hidden"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <figure className="rp-card group relative aspect-[16/10] overflow-hidden">
              <SlotImage
                slot="backgrounds"
                index={0}
                alt="Vaulted dining room with candlelight and copper fixtures"
                className="h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--border-copper,rgba(212,165,116,0.2))]" aria-hidden />
            </figure>
          </div>

          <div className="flex flex-col justify-center lg:col-span-5">
            <p className="rp-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rp-atmosphere-title" className="rp-headline text-[clamp(2rem,4vw,3rem)]">
              {title}
            </h2>
            <div className="rp-copper-rule my-6" />
            <p className="rp-body">{subtitle}</p>

            <figure className="rp-card group relative mt-10 aspect-[4/3] overflow-hidden">
              <SlotImage
                slot="backgrounds"
                index={1}
                alt="Hand-finished table setting with crystal stemware"
                className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            </figure>
          </div>
        </div>

        <blockquote className="relative mx-auto mt-24 max-w-3xl px-6 text-center sm:px-10">
          <span
            className="rp-font-display pointer-events-none absolute -top-6 start-1/2 -translate-x-1/2 text-6xl text-[var(--color-copper)]/25"
            aria-hidden
          >
            &ldquo;
          </span>
          <p className="rp-font-display text-[clamp(1.5rem,3vw,2.25rem)] italic leading-snug text-[var(--color-foreground)]">
            An evening that unfolds like a well-composed sonnet — each course a verse, the room its refrain.
          </p>
          <footer className="rp-font-body mt-8 text-[0.6875rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
            — The Evening Standard
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
