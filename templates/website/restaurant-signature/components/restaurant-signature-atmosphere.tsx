"use client";

import { resolveSiteImage, resolveSlotImage } from "@/lib/site-images";

type RestaurantSignatureAtmosphereProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RestaurantSignatureAtmosphere({
  eyebrow = "The room",
  title = "Candlelit intimacy",
  subtitle = "Twelve tables beneath vaulted timber and soft copper light. The room breathes with the rhythm of service — unhurried, attentive, present.",
}: RestaurantSignatureAtmosphereProps) {
  const wide = resolveSlotImage("about", 5);
  const detail = resolveSlotImage("about", 6);

  return (
    <section
      id="atmosphere"
      data-v2-component="restaurant-signature-atmosphere"
      aria-labelledby="rs-atmosphere-title"
      className="rs-section overflow-hidden"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <figure className="relative aspect-[16/10] overflow-hidden">
              {wide ? (
                <img
                  src={wide}
                  alt="Dining room interior with warm lighting"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary) 0%, var(--color-surface) 100%)",
                  }}
                />
              )}
            </figure>
          </div>

          <div className="flex flex-col justify-center lg:col-span-5">
            <p className="rs-eyebrow mb-5">{eyebrow}</p>
            <h2 id="rs-atmosphere-title" className="rs-headline text-[clamp(2rem,4vw,3rem)]">
              {title}
            </h2>
            <div className="rs-copper-rule my-6" />
            <p className="rs-body">{subtitle}</p>

            <figure className="relative mt-10 aspect-[4/3] overflow-hidden">
              {detail ? (
                <img
                  src={detail}
                  alt="Table setting detail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{ background: "var(--color-surface)" }}
                />
              )}
            </figure>
          </div>
        </div>

        <blockquote className="mx-auto mt-20 max-w-3xl border-s-2 border-[var(--color-copper)] ps-8">
          <p className="rs-font-display text-[clamp(1.5rem,3vw,2.25rem)] italic leading-snug text-[var(--color-foreground)]">
            &ldquo;An evening that unfolds like a well-composed sonnet — each course a verse, the room its refrain.&rdquo;
          </p>
          <footer className="rs-font-body mt-6 text-[0.6875rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
            — The Evening Standard
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
