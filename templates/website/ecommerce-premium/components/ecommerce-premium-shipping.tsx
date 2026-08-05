"use client";

const DEFAULT_PILLARS = [
  {
    title: "Complimentary shipping",
    description: "Express delivery on orders over $150. Carbon-neutral packaging on every shipment.",
    detail: "48h delivery",
  },
  {
    title: "Easy returns",
    description: "30-day returns with prepaid labels. Concierge support for exchanges and sizing.",
    detail: "Hassle-free",
    highlighted: true,
  },
  {
    title: "Gift services",
    description: "Handwritten notes, artisan wrapping, and scheduled delivery for special occasions.",
    detail: "Concierge",
  },
];

type EcommercePremiumShippingProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  pillars?: Array<{ title: string; description: string; detail?: string; highlighted?: boolean }>;
};

export function EcommercePremiumShipping({
  eyebrow = "Shipping & care",
  title = "Every order handled with intention",
  subtitle = "From atelier to doorstep — transparent policies, responsive support, and packaging that honors the craft.",
  pillars = DEFAULT_PILLARS,
}: EcommercePremiumShippingProps) {
  return (
    <section
      id="shipping"
      data-v2-component="ecommerce-premium-shipping"
      aria-labelledby="ec-shipping-title"
      className="ec-section ec-section-glow relative bg-[var(--color-background)]"
    >
      <div className="ec-glow-orb -start-24 top-0 h-72 w-72 bg-[var(--color-champagne)]" aria-hidden />
      <div className="relative mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-14 text-center">
          <p className="ec-eyebrow mb-4">{eyebrow}</p>
          <h2 id="ec-shipping-title" className="ec-headline-sm">
            {title}
          </h2>
          <div className="ec-gold-rule mx-auto mt-5" aria-hidden />
          <p className="ec-body mx-auto mt-6 max-w-lg">{subtitle}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className={[
                "ec-card flex flex-col p-8 sm:p-9",
                pillar.highlighted ? "ec-card-featured lg:-translate-y-1" : "",
              ].join(" ")}
            >
              {pillar.detail ? (
                <span className="ec-badge mb-5 w-fit">{pillar.detail}</span>
              ) : null}
              <h3 className="ec-font-display text-xl">{pillar.title}</h3>
              <p className="ec-body mt-3 flex-1 text-sm">{pillar.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
