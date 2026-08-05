"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company?: string;
};

const DEFAULT_ITEMS: Testimonial[] = [
  {
    quote:
      "Meridian Capital has been our family's trusted steward for three generations — their discretion and rigor are unmatched in private wealth management.",
    name: "Catherine Holt",
    role: "Family Principal",
    company: "Holt Family Office",
  },
  {
    quote:
      "Their partners understand institutional complexity. Our endowment portfolio has outperformed benchmarks while maintaining the governance standards our board demands.",
    name: "Raj Mehta",
    role: "Chief Investment Officer",
    company: "Harbor Endowment",
  },
  {
    quote:
      "The most disciplined advisory relationship we have — fiduciary integrity, global reach, and a team that treats our legacy as their own.",
    name: "Elena Brandt",
    role: "Managing Director",
    company: "Northgate Private Bank",
  },
];

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function FinancePremiumTestimonials({
  eyebrow = "Client perspectives",
  title = "Trusted across generations",
  subtitle = "Families and institutions who entrust Meridian Capital with their most significant capital decisions.",
  items = DEFAULT_ITEMS,
}: Props) {
  return (
    <section
      id="testimonials"
      data-v2-component="finance-premium-testimonials"
      aria-labelledby="testimonials-title"
      className="fn-section fn-section-alt"
    >
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-12 text-center">
          <p className="fn-eyebrow mb-3">{eyebrow}</p>
          <h2 id="testimonials-title" className="fn-headline-sm">
            {title}
          </h2>
          <div className="fn-accent-line mx-auto mt-4" aria-hidden />
          {subtitle ? <p className="fn-body text-muted-foreground mx-auto mt-5 max-w-lg">{subtitle}</p> : null}
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {items.map((item, index) => {
            const featured = index === 1 && items.length >= 3;
            return (
              <figure
                key={`${item.name}-${index}`}
                className={[
                  "fn-card relative flex flex-col p-7 sm:p-8",
                  featured ? "fn-card-featured md:-translate-y-1" : "",
                ].join(" ")}
              >
                <span className="fn-quote-mark absolute end-6 top-4 select-none" aria-hidden>
                  &ldquo;
                </span>
                <blockquote className="fn-body relative z-[1] mt-2 flex-1 text-base leading-relaxed">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-[var(--border-default)] pt-5">
                  <SlotImage
                    slot="testimonials"
                    index={index}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-[var(--color-surface)]"
                    loading="lazy"
                  />
                  <div>
                    <p className="fn-font-body text-sm font-semibold text-[var(--color-foreground)]">
                      {item.name}
                    </p>
                    <p className="fn-font-body text-xs text-[var(--color-muted)]">
                      {item.role}
                      {item.company ? ` · ${item.company}` : ""}
                    </p>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
