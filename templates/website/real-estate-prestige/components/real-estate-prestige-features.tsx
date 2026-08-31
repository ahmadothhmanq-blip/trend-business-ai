"use client";

const DEFAULT_FEATURES = [
  { title: "Core offering", description: "The primary value you deliver — explained clearly and confidently." },
  { title: "Expert support", description: "Guidance, onboarding, and partnership from first conversation onward." },
  { title: "Proven outcomes", description: "Results your clients can measure and trust over time." },
  { title: "Flexible engagement", description: "Options that adapt to scope, timeline, and budget." },
];

type FeatureItem = { title: string; description: string; icon?: string; span?: string };

type RealEstatePrestigeFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
};

export function RealEstatePrestigeFeatures({
  eyebrow = "What we offer",
  title = "Capabilities built around your goals",
  subtitle = "Clear value propositions presented with structure and craft.",
  items = DEFAULT_FEATURES,
}: RealEstatePrestigeFeaturesProps) {
  if (!items.length) return null;

  return (
    <section
      id="features"
      data-v2-component="real-estate-prestige-features"
      aria-labelledby="rep-features-title"
      className="rep-reveal rep-section py-20 sm:py-28"
    >
      <div className="rep-container">
        <header className="rep-section-header rep-section-header--rule">
          {eyebrow ? <p className="rep-eyebrow">{eyebrow}</p> : null}
          <h2 id="rep-features-title" className="rep-headline-sm text-balance">
            {title}
          </h2>
          {subtitle ? <p className="rep-body">{subtitle}</p> : null}
        </header>
        <ul className="rep-reveal-stagger rep-editorial-list divide-y divide-[var(--border-default)]">
          {items.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="df-reveal-stagger rep-list-row grid gap-6 py-10 lg:grid-cols-[4rem_1fr] lg:items-start"
            >
              <span className="rep-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <h3 className="rep-title-lg">{item.title}</h3>
                <p className="rep-body-sm mt-3 max-w-2xl">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
