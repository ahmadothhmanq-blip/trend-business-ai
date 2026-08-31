"use client";

const FEATURED = {
  title: "Archetype",
  category: "Brand identity · Global launch",
  year: "2025",
};

const SECONDARY = [
  { title: "Monolith", category: "Product & campaign" },
  { title: "Helix", category: "Digital platform" },
];

const LOGOS = ["Archetype", "Monolith", "Helix", "Northwind", "Vertex", "Axiom"];

type CreativeAgencyPremiumHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function CreativeAgencyPremiumHero({
  title = "Brands built to lead categories",
  subtitle = "An independent creative studio for companies that compete on design — identity, product, and launch craft for global markets.",
  eyebrow = "Volt Studio",
  primaryCta = "Start a project",
  secondaryCta = "View work",
  imageUrl = null,
}: CreativeAgencyPremiumHeroProps) {
  return (
    <section
      id="top"
      data-v2-component="creative-agency-premium-hero"
      aria-labelledby="sv-hero-title"
      className="relative overflow-hidden bg-[var(--color-background)] pb-20 pt-16 sm:pb-28 sm:pt-20"
    >
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl motion-safe:animate-[sv-slide-rise_0.7s_ease_both]">
            <p className="sv-font-mono text-[0.6875rem] tracking-[0.25em] text-[var(--color-volt)]">{eyebrow}</p>
            <h1
              id="sv-hero-title"
              className="sv-font-display mt-6 text-[clamp(2.75rem,5.5vw,4.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--color-ghost)] [text-transform:none]"
            >
              {title}
            </h1>
            <p className="mt-7 text-lg leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#contact" className="sv-btn-volt sv-focus-ring">{primaryCta}</a>
              <a href="#portfolio" className="sv-btn-ghost sv-focus-ring">{secondaryCta}</a>
            </div>
          </div>

          <div className="space-y-4 motion-safe:animate-[sv-slide-rise_0.75s_ease_0.1s_both]">
            <a
              href="#portfolio"
              className="group relative block aspect-[16/10] overflow-hidden border border-[var(--border-default)]"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)] via-[color-mix(in_srgb,var(--color-primary)_70%,#000)] to-[var(--color-primary)] transition-transform duration-700 group-hover:scale-[1.02]"
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="sv-font-mono text-xs text-[var(--color-volt)]">{FEATURED.category}</p>
                <p className="sv-font-display mt-2 text-3xl font-semibold text-white [text-transform:none]">{FEATURED.title}</p>
                <p className="mt-3 text-sm text-white/60">{FEATURED.year} · View case study →</p>
              </div>
            </a>
            <div className="grid grid-cols-2 gap-4">
              {SECONDARY.map((item, index) => (
                <a
                  key={item.title}
                  href="#portfolio"
                  className="group relative aspect-[4/3] overflow-hidden border border-[var(--border-default)]"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      index === 0
                        ? "from-[color-mix(in_srgb,var(--color-secondary)_90%,#000)] to-[var(--color-primary)]"
                        : "from-[color-mix(in_srgb,var(--color-primary)_80%,#000)] to-[color-mix(in_srgb,var(--color-accent)_25%,var(--color-primary))]"
                    }`}
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="sv-font-display text-lg font-semibold text-white [text-transform:none]">{item.title}</p>
                    <p className="mt-1 text-xs text-white/55">{item.category}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-[var(--border-default)] pt-8 motion-safe:animate-[sv-slide-rise_0.8s_ease_0.18s_both]">
          <p className="sv-font-mono mb-5 text-[0.625rem] tracking-[0.2em] text-[var(--color-muted)]">SELECTED CLIENTS</p>
          <ul className="flex flex-wrap gap-x-10 gap-y-3">
            {LOGOS.map((name) => (
              <li key={name} className="text-sm font-medium text-[var(--color-muted)]">{name}</li>
            ))}
          </ul>
        </div>
      </div>
      {imageUrl ? <img src={imageUrl} alt="" className="sr-only" aria-hidden /> : null}
    </section>
  );
}
