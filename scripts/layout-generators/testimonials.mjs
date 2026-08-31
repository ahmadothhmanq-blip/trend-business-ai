import { DEFAULT_TESTIMONIALS } from "../layout-dna.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const TESTIMONIALS_GENERATORS = {
  "grid-cards": gridCards,
  "single-spotlight": singleSpotlight,
  "marquee-scroll": marqueeScroll,
  "split-quote-stats": splitQuoteStats,
  "masonry-quotes": masonryQuotes,
  "bubble-cards": bubbleCards,
  "resort-guest": resortGuest,
  "chef-review": chefReview,
  "alumni-grid": alumniGrid,
  "shop-reviews": shopReviews,
  "saas-logos-row": saasLogosRow,
  "portfolio-case-study": portfolioCaseStudy,
  "estate-client": estateClient,
  "nature-cards": natureCards,
  "aurora-glass": auroraGlass,
  "noir-minimal-quote": noirMinimalQuote,
  "terminal-output": terminalOutput,
  "blueprint-testimonials": blueprintTestimonials,
  "authority-quotes": authorityQuotes,
  "wellness-soft-stack": wellnessSoftStack,
};

export function generateTestimonials(entry, layoutKey) {
  const fn = TESTIMONIALS_GENERATORS[layoutKey] ?? gridCards;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function testimonialsHeader({ p, pkg, Pascal }) {
  return `"use client";

const DEFAULT_ITEMS = ${JSON.stringify(DEFAULT_TESTIMONIALS, null, 2)};

type Testimonial = { quote: string; name: string; role: string; company?: string };

function testimonialInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type ${Pascal}TestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
};

export function ${Pascal}Testimonials({
  eyebrow = "Client voices",
  title = "Trusted by leaders worldwide",
  subtitle = "Organizations that chose excellence.",
  items = DEFAULT_ITEMS,
}: ${Pascal}TestimonialsProps) {
  if (!items.length) return null;`;
}

function gridCards({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" aria-labelledby="${p}-testimonials-title" className="${p}-section-alt bg-[var(--color-surface)] py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <header className="mb-10 text-center">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h2 id="${p}-testimonials-title" className="${p}-headline-sm mt-2">{title}</h2>
          <p className="${p}-body mx-auto mt-4 max-w-xl text-[var(--color-muted)]">{subtitle}</p>
        </header>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.name} className="${p}-card p-7">
              <blockquote className="text-base leading-relaxed">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-sm font-semibold text-[var(--color-accent)]"
                  aria-hidden
                >
                  {testimonialInitials(item.name)}
                </span>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-[var(--color-muted)]">{item.role}{item.company ? \` · \${item.company}\` : ""}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function singleSpotlight({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  const featured = items[0];
  if (!featured) return null;
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="relative flex min-h-[60vh] items-center bg-[var(--color-primary)] px-5 py-20 sm:px-8">
      <blockquote className="mx-auto max-w-4xl text-center">
        <p className="${p}-display text-2xl leading-snug sm:text-4xl">&ldquo;{featured.quote}&rdquo;</p>
        <footer className="mt-10">
          <p className="font-semibold">{featured.name}</p>
          <p className="text-sm opacity-70">{featured.role}</p>
        </footer>
      </blockquote>
    </section>
  );
}
`;
}

function marqueeScroll({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="${p}-section overflow-hidden py-16">
      <h2 className="${p}-headline-sm mb-10 px-5 sm:px-8">{title}</h2>
      <div className="flex gap-6 overflow-x-auto px-5 pb-4 snap-x sm:px-8">
        {items.map((item) => (
          <figure key={item.name} className="${p}-card min-w-[20rem] flex-shrink-0 snap-start p-6 sm:min-w-[24rem]">
            <blockquote className="text-lg font-medium">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="mt-4 text-sm text-[var(--color-muted)]">— {item.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
`;
}

function splitQuoteStats({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  const main = items[0];
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="${p}-section-alt py-16">
      <div className="mx-auto grid max-w-[82rem] gap-12 px-5 lg:grid-cols-2 sm:px-8">
        <blockquote>
          <p className="${p}-eyebrow">{eyebrow}</p>
          <p className="${p}-headline-sm mt-4">&ldquo;{main?.quote}&rdquo;</p>
          <footer className="mt-6 font-semibold">{main?.name}, {main?.role}</footer>
        </blockquote>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.name} className="${p}-card p-5">
              <p className="text-sm">&ldquo;{item.quote.slice(0, 80)}…&rdquo;</p>
              <p className="mt-3 text-xs text-[var(--color-muted)]">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function masonryQuotes({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="py-16">
      <div className="mx-auto max-w-[82rem] columns-1 gap-4 px-5 sm:columns-2 sm:px-8 lg:columns-3">
        <h2 className="${p}-headline-sm mb-8 break-inside-avoid">{title}</h2>
        {items.map((item, i) => (
          <figure key={item.name} className={\`${p}-card mb-4 break-inside-avoid p-6 \${i === 1 ? "min-h-[14rem]" : ""}\`}>
            <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="mt-4 text-sm font-medium">{item.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
`;
}

function bubbleCards({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="bg-[var(--color-background)] py-20">
      <div className="mx-auto max-w-3xl space-y-6 px-5 sm:px-8">
        {items.map((item) => (
          <figure key={item.name} className="rounded-3xl bg-[var(--color-surface)] p-8 shadow-sm">
            <blockquote className="text-center text-lg">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="mt-4 text-center text-sm text-[var(--color-muted)]">{item.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
`;
}

function resortGuest({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="${p}-section-glow py-16 text-center">
      <h2 className="${p}-headline-sm">{title}</h2>
      <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
        {items.map((item) => (
          <figure key={item.name}>
            <p className="text-[var(--color-accent)]" aria-label="5 stars">★★★★★</p>
            <blockquote className="mt-4 text-sm">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="mt-3 text-xs text-[var(--color-muted)]">{item.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
`;
}

function chefReview({ p, pkg, Pascal }) {
  return gridCards({ p, pkg, Pascal }).replace(
    `className="${p}-section-alt bg-[var(--color-surface)] py-16"`,
    `className="border-y border-[var(--color-accent)]/20 py-16"`,
  );
}

function alumniGrid({ p, pkg, Pascal }) {
  return gridCards({ p, pkg, Pascal }).replace(
    `title = "Trusted by leaders worldwide"`,
    `title = "Alumni voices"`,
  );
}

function shopReviews({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="py-12">
      <div className="mx-auto max-w-xl px-5 sm:px-8">
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
        <ul className="mt-8 space-y-6">
          {items.map((item) => (
            <li key={item.name} className="border-b border-[var(--border-subtle)] pb-6">
              <p className="text-[var(--color-accent)] text-xs">★★★★★</p>
              <p className="mt-2 text-sm">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">{item.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
`;
}

function saasLogosRow({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="${p}-section-alt py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm text-center">{title}</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-8 opacity-50">
          {["Vercel", "Stripe", "Linear", "Notion"].map((logo) => <span key={logo} className="text-sm font-semibold">{logo}</span>)}
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <blockquote key={item.name} className="${p}-card p-6 text-sm">&ldquo;{item.quote}&rdquo;<footer className="mt-4 font-medium">— {item.name}</footer></blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function portfolioCaseStudy({ p, pkg, Pascal }) {
  return singleSpotlight({ p, pkg, Pascal }).replace(
    `min-h-[60vh]`,
    `min-h-[70vh]`,
  );
}

function estateClient({ p, pkg, Pascal }) {
  return splitQuoteStats({ p, pkg, Pascal });
}

function natureCards({ p, pkg, Pascal }) {
  return bubbleCards({ p, pkg, Pascal });
}

function auroraGlass({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent),transparent_60%)] opacity-15" aria-hidden />
      <div className="relative mx-auto grid max-w-[82rem] gap-6 px-5 sm:grid-cols-3 sm:px-8">
        {items.map((item) => (
          <figure key={item.name} className="${p}-glass-card rounded-2xl border border-[var(--border-accent)] p-6 backdrop-blur">
            <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="mt-4 text-sm text-[var(--color-muted)]">{item.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
`;
}

function noirMinimalQuote({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="py-16 font-mono">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        {items.map((item) => (
          <blockquote key={item.name} className="mb-10 border-s-2 border-[var(--color-accent)] ps-6">
            <p>&gt; {item.quote}</p>
            <footer className="mt-3 text-xs text-[var(--color-muted)]">// {item.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
`;
}

function terminalOutput({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="bg-[#0a0f0a] py-12 font-mono text-sm text-[#00ff88]">
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <p className="text-[#00ff88]/50">$ cat testimonials.log</p>
        <pre className="mt-4 whitespace-pre-wrap">
{items.map((item) => \`[OK] \${item.name}: "\${item.quote}"\`).join("\\n")}
        </pre>
      </div>
    </section>
  );
}
`;
}

function blueprintTestimonials({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="py-16" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
      <div className="mx-auto max-w-[82rem] border-2 border-dashed border-[var(--color-accent)] px-5 py-10 sm:px-8">
        <p className="${p}-font-mono text-xs text-[var(--color-accent)]">REF: TESTIMONIALS</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {items.map((item, i) => (
            <figure key={item.name} className="border border-[var(--border-default)] p-5">
              <span className="text-xs text-[var(--color-muted)]">T-{String(i + 1).padStart(2, "0")}</span>
              <blockquote className="mt-2 text-sm">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-3 text-xs">{item.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function authorityQuotes({ p, pkg, Pascal }) {
  return `${testimonialsHeader({ p, pkg, Pascal })}
  return (
    <section id="testimonials" data-v2-component="${pkg}-testimonials" className="${p}-section-alt py-16">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <h2 className="${p}-headline-sm">{title}</h2>
        <div className="mt-10 space-y-8">
          {items.map((item) => (
            <figure key={item.name} className="grid gap-6 border-s-4 border-[var(--color-accent)] ps-8 lg:grid-cols-[1fr_auto]">
              <blockquote className="text-lg italic">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="text-sm font-semibold lg:text-end">{item.name}<br /><span className="font-normal text-[var(--color-muted)]">{item.role}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function wellnessSoftStack({ p, pkg, Pascal }) {
  return bubbleCards({ p, pkg, Pascal });
}
