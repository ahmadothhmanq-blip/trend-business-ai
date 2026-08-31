"use client";

const DEFAULT_HIGHLIGHTS = [
  "Founded by industry veterans with global experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

const DEFAULT_PULL_QUOTE =
  "Partnerships built on clarity, craft, and dependable delivery.";

type HotelResortPremiumAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
  pullQuote?: string;
};

export function HotelResortPremiumAbout({
  eyebrow = "Our story",
  title = "Built for teams that compete globally",
  subtitle,
  body = "We started with a simple belief: world-class organizations deserve tools and partners that match their ambition. Today we help teams across industries deliver measurable outcomes.",
  imageUrl,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Meet the team",
  pullQuote = DEFAULT_PULL_QUOTE,
}: HotelResortPremiumAboutProps) {
  const visualUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
  const hasAboutVisual = Boolean(visualUrl);
  const pills = Array.isArray(highlights) && highlights.length ? highlights : DEFAULT_HIGHLIGHTS;

  return (
    <section
      id="about"
      data-v2-component="hotel-resort-premium-about"
      className="hr-reveal hr-section hr-section-alt"
    >
      <div
        className={`hr-container grid gap-12 ${hasAboutVisual ? "lg:grid-cols-2 lg:items-center" : "max-w-3xl"}`}
      >
        {hasAboutVisual ? (
          <div className="hr-panel hr-about-panel hr-split-left overflow-hidden lg:-translate-y-4">
            <img
              src={visualUrl}
              alt=""
              className="aspect-[4/5] w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}
        <div className={hasAboutVisual ? "hr-split-right" : ""}>
          {eyebrow ? <p className="hr-eyebrow">{eyebrow}</p> : null}
          <h2 className="hr-headline-sm mt-4">{title}</h2>
          <div className="hr-azure-rule my-5" />
          {subtitle ? <p className="hr-lead">{subtitle}</p> : null}
          <p className="hr-body mt-5 max-w-xl">{body}</p>
          {!hasAboutVisual && pullQuote ? (
            <blockquote className="hr-about-pull mt-8">
              <p className="hr-quote">&ldquo;{pullQuote}&rdquo;</p>
            </blockquote>
          ) : null}
          {pills.length ? (
            <ul className="hr-reveal-stagger mt-8 flex flex-wrap gap-2">
              {pills.map((highlight) => (
                <li key={highlight} className="hr-highlight-pill">
                  {highlight}
                </li>
              ))}
            </ul>
          ) : null}
          <a href="#contact" className="hr-btn-primary hr-focus-ring mt-10 inline-flex">
            {primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
