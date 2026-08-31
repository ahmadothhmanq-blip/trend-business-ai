"use client";

const DEFAULT_TILES = [
  { title: "Design systems", description: "Composable tokens, motion, and layout primitives that feel inevitable.", span: "tall", field: "a" },
  { title: "Rapid prototyping", description: "Ship interactive concepts in days, not quarters.", span: "compact", field: "b" },
  { title: "Launch ops", description: "Release choreography for teams shipping at global velocity.", span: "wide", field: "c" },
  { title: "Scale engineering", description: "Architecture that survives the second million users.", span: "compact", field: "a" },
];

type MosaicTile = {
  title: string;
  description: string;
  span?: string;
  field?: string;
};

type PrismAuroraHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  brandName?: string;
  tiles?: MosaicTile[];
};

function tileClasses(span?: string, field?: string): string {
  const fieldClass =
    field === "b" ? "pr-tile-field-b" : field === "c" ? "pr-tile-field-c" : "pr-tile-field-a";
  if (span === "tall") return `pr-tile ${fieldClass} pr-span-5 pr-row-2`;
  if (span === "wide") return `pr-tile ${fieldClass} pr-span-8`;
  if (span === "hero") return `pr-tile ${fieldClass} pr-span-7 pr-row-2`;
  return `pr-tile ${fieldClass} pr-span-4`;
}

export function PrismAuroraHero({
  title = "Build products that feel inevitable",
  subtitle = "Aurora-grade systems, rapid prototyping, and launch orchestration for teams shipping to millions.",
  eyebrow = "Global software studio",
  primaryCta = "Start building",
  secondaryCta = "See our process",
  brandName = "Prism",
  tiles = DEFAULT_TILES,
}: PrismAuroraHeroProps) {
  return (
    <section id="top" data-v2-component="prism-aurora-hero" aria-labelledby="pr-hero-title" className="pr-reveal bg-[var(--color-background)] px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
      <div className="pr-mosaic pr-reveal-stagger mx-auto max-w-[88rem]">
        <article className="pr-tile pr-tile-brand pr-span-7 pr-row-3 flex flex-col justify-between gap-8">
          <div>
            <p className="pr-eyebrow">{eyebrow}</p>
            <p className="pr-font-display mt-6 text-[clamp(3rem,8vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-[var(--color-foreground)]">
              {brandName}
            </p>
            <h1 id="pr-hero-title" className="pr-headline-sm mt-6 max-w-[18ch]">
              {title}
            </h1>
            <p className="pr-body mt-4 max-w-md">{subtitle}</p>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full">
            <span className="w-[42%] bg-[var(--color-primary)]" aria-hidden />
            <span className="w-[28%] bg-[var(--color-accent)]" aria-hidden />
            <span className="w-[30%] bg-[var(--color-secondary,#3730A3)]" aria-hidden />
          </div>
        </article>

        <article className="pr-tile pr-tile-cta pr-span-5 pr-row-2 flex flex-col justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Next step</p>
            <p className="pr-font-display mt-3 text-2xl font-bold leading-tight sm:text-3xl">Compose your mosaic. Ship the product.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#contact" className="pr-btn-primary pr-focus-ring !bg-white !text-[var(--color-primary)] !shadow-none">
              {primaryCta}
            </a>
            <a href="#about" className="pr-btn-secondary pr-focus-ring !border-white/30 !bg-white/10 !text-white">
              {secondaryCta}
            </a>
          </div>
        </article>

        {tiles.slice(0, 4).map((tile, index) => (
          <article key={tile.title} className={tileClasses(tile.span ?? (index === 0 ? "tall" : index === 2 ? "wide" : "compact"), tile.field)}>
            <p className="pr-font-display text-xs font-semibold tracking-[0.14em] text-[var(--color-accent)]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="pr-font-display mt-3 text-xl font-bold tracking-[-0.02em] sm:text-2xl">{tile.title}</h2>
            <p className="pr-body mt-2 text-sm">{tile.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
