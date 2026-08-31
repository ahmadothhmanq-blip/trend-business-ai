"use client";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

const DEFAULT_ITEMS: Testimonial[] = [
  {
    quote:
      "Meridian brought board-level clarity to a complex transformation — our operating model is stronger and our stakeholders finally align on priorities.",
    name: "Catherine Holt",
    role: "Chief Operating Officer",
    company: "Axiom Industrial Group",
  },
  {
    quote:
      "Their partners embedded with our leadership team and delivered measurable EBITDA impact within the first two quarters.",
    name: "Raj Mehta",
    role: "Managing Director",
    company: "Harbor Capital Partners",
  },
  {
    quote:
      "The most rigorous advisory relationship we have had — governance, risk, and execution under one disciplined program.",
    name: "Elena Brandt",
    role: "General Counsel",
    company: "Northgate Financial",
  },
];

type Props = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function CorporateBusinessTestimonials({
  eyebrow = "Client stories",
  title = "Trusted by executive sponsors",
  subtitle = "Leaders who partner with Meridian for strategy, transformation, and governance.",
  items = DEFAULT_ITEMS,
}: Props) {
  const [featured, ...rest] = items;

  return (
    <section
      id="testimonials"
      data-v2-component="corporate-business-testimonials"
      aria-labelledby="cb-testimonials-title"
      className="cb-section cb-section-alt"
    >
      <div className="cb-container">
        <header className="mb-16 max-w-2xl">
          <p className="cb-eyebrow mb-5">{eyebrow}</p>
          <h2 id="cb-testimonials-title" className="cb-headline-sm">
            {title}
          </h2>
          <p className="cb-prose mt-6">{subtitle}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <article className="cb-card-featured relative flex flex-col justify-between p-10 sm:p-12 lg:col-span-7 lg:row-span-2 lg:min-h-[24rem]">
            <div>
              <span className="cb-quote-mark" aria-hidden>
                {"\u201C"}
              </span>
              <blockquote className="cb-font-display -mt-6 text-[clamp(1.375rem,2.5vw,1.75rem)] font-medium leading-[1.45] text-white/92">
                {featured.quote}
              </blockquote>
            </div>
            <footer className="mt-10 border-t border-white/10 pt-8">
              <p className="cb-font-body text-sm font-medium text-white">{featured.name}</p>
              <p className="cb-font-body mt-1 text-sm text-white/55">
                {featured.role}, {featured.company}
              </p>
              <p className="cb-star mt-4 text-sm" aria-label="5 out of 5 stars">
                ★★★★★
              </p>
            </footer>
          </article>

          {rest.map((item) => (
            <article key={item.name} className="cb-card flex flex-col justify-between p-8 lg:col-span-5">
              <blockquote className="cb-font-body text-[0.9375rem] leading-[1.75] text-[var(--color-foreground)]">
                {"\u201C"}
                {item.quote}
                {"\u201D"}
              </blockquote>
              <footer className="mt-8 border-t border-[var(--border-subtle)] pt-6">
                <p className="cb-font-body text-sm font-medium text-[var(--color-foreground)]">{item.name}</p>
                <p className="cb-font-body mt-1 text-xs text-[var(--color-muted)]">
                  {item.role}, {item.company}
                </p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
