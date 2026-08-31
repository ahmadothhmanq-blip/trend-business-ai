"use client";

type GlanceItem = { href?: string; label: string; value: string };

type HotelResortPremiumHeroProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  badge?: string;
  glanceLabel?: string;
  glanceItems?: GlanceItem[];
};

const DEFAULT_GLANCE: GlanceItem[] = [
  { label: "Timeline", value: "4–8 weeks" },
  { label: "Team", value: "Dedicated lead" },
  { label: "Scope", value: "Clear plan" },
  { label: "Support", value: "Included" },
];

function HeroGlance({
  glanceLabel,
  glanceItems,
  variant,
}: {
  glanceLabel?: string;
  glanceItems: GlanceItem[];
  variant: "overlay" | "strip";
}) {
  const className = variant === "overlay" ? "hr-hero-glance" : "hr-hero-glance-strip";

  return (
    <aside className={className} aria-label={glanceLabel}>
      {glanceLabel ? <p className="hr-label mb-3">{glanceLabel}</p> : null}
      <dl>
        {glanceItems.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export function HotelResortPremiumHero({
  eyebrow = "Welcome",
  title = "Craft experiences worth remembering",
  subtitle = "A refined platform for organizations that value clarity, warmth, and dependable delivery — designed to feel personal from the first visit.",
  primaryCta = "Get started",
  secondaryCta = "Learn more",
  imageUrl,
  badge = "Trusted by leading teams",
  glanceLabel = "At a glance",
  glanceItems = DEFAULT_GLANCE,
}: HotelResortPremiumHeroProps) {
  const visualUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
  const hasHeroVisual = Boolean(visualUrl);
  const items = Array.isArray(glanceItems) && glanceItems.length ? glanceItems : DEFAULT_GLANCE;

  return (
    <section
      id="top"
      data-v2-component="hotel-resort-premium-hero"
      aria-labelledby="hr-hero-title"
      className="hr-hero hr-section"
    >
      <div className={`hr-container hr-hero-grid ${hasHeroVisual ? "" : "hr-hero-grid--solo"}`}>
        <div className="hr-hero-stagger">
          {eyebrow ? <p className="hr-eyebrow hr-hero-item">{eyebrow}</p> : null}
          <h1 id="hr-hero-title" className="hr-headline mt-5 hr-hero-item">
            {title}
          </h1>
          <div className="hr-azure-rule my-6 hr-hero-item" />
          <p className="hr-lead max-w-lg hr-hero-item">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3 hr-hero-item">
            <a href="#contact" className="hr-btn-primary hr-focus-ring">
              {primaryCta}
            </a>
            <a href="#features" className="hr-btn-secondary hr-focus-ring">
              {secondaryCta}
            </a>
          </div>
          {badge ? <p className="hr-hero-badge mt-8 hr-hero-item">{badge}</p> : null}
          {!hasHeroVisual && items.length ? (
            <div className="hr-hero-item">
              <HeroGlance glanceLabel={glanceLabel} glanceItems={items} variant="strip" />
            </div>
          ) : null}
        </div>

        {hasHeroVisual ? (
          <div className="hr-hero-frame motion-safe:animate-[hr-reveal-section_1s_cubic-bezier(0.22,1,0.36,1)_0.15s_both]">
            <div className="hr-hero-media">
              <img
                src={visualUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
              {items.length ? (
                <HeroGlance glanceLabel={glanceLabel} glanceItems={items} variant="overlay" />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
