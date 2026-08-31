"use client";

const DEFAULT_HIGHLIGHTS = [
  "Founded by industry veterans with global experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

type PrismAuroraAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function PrismAuroraAbout({
  eyebrow = "Our story",
  title = "Built for teams that compete globally",
  body = "We started with a simple belief: world-class organizations deserve tools and partners that match their ambition. Today we help teams across industries deliver measurable outcomes.",
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Meet the team",
}: PrismAuroraAboutProps) {
  return (
    <section id="about" data-v2-component="prism-aurora-about" className="pr-reveal pr-section bg-[var(--color-background)] px-4 sm:px-6">
      <div className="pr-mosaic mx-auto max-w-[88rem]">
        <article className="pr-tile pr-tile-ink pr-span-5 pr-row-2 flex flex-col justify-end">
          <p className="pr-eyebrow !text-[color-mix(in_srgb,var(--color-background)_70%,transparent)]">{eyebrow}</p>
          <h2 className="pr-headline-sm mt-4 !text-[var(--color-background)]">{title}</h2>
        </article>
        <article className="pr-tile pr-span-7 pr-row-2 flex flex-col justify-between gap-8">
          <p className="pr-body max-w-xl text-base sm:text-lg">{body}</p>
          <div className="pr-mosaic !gap-2">
            {highlights.map((item, i) => (
              <div
                key={item}
                className={`pr-tile !min-h-0 !rounded-xl !p-4 ${i === 0 ? "pr-span-7 pr-tile-field-a" : i === 1 ? "pr-span-5 pr-tile-field-b" : "pr-span-12 pr-tile-field-c"}`}
              >
                <p className="pr-font-body text-sm font-medium text-[var(--color-foreground)]">{item}</p>
              </div>
            ))}
          </div>
          <a href="#contact" className="pr-btn-primary pr-focus-ring self-start">
            {primaryCta}
          </a>
        </article>
      </div>
    </section>
  );
}
