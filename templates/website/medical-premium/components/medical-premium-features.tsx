"use client";

const DEFAULT_FEATURES = [
  { title: "Core offering", description: "The primary value you deliver — explained clearly and confidently." },
  { title: "Expert support", description: "Guidance, onboarding, and partnership from first conversation onward." },
  { title: "Proven outcomes", description: "Results your clients can measure and trust over time." },
  { title: "Flexible engagement", description: "Options that adapt to scope, timeline, and budget." },
];

type FeatureItem = { title: string; description: string; icon?: string; span?: string };

type MedicalPremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
};

export function MedicalPremiumFeatures({
  eyebrow = "What we offer",
  title = "Capabilities built around your goals",
  subtitle = "Clear value propositions presented with structure and craft.",
  items = DEFAULT_FEATURES,
}: MedicalPremiumFeaturesProps) {
  if (!items.length) return null;

  return (
    <section
      id="features"
      data-v2-component="medical-premium-features"
      aria-labelledby="mp-features-title"
      className="mp-reveal mp-section py-20 sm:py-28"
    >
      <div className="mp-container">
        <header className="mp-section-header mp-section-header--rule">
          {eyebrow ? <p className="mp-eyebrow">{eyebrow}</p> : null}
          <h2 id="mp-features-title" className="mp-headline-sm mt-4 text-balance">
            {title}
          </h2>
          {subtitle ? <p className="mp-body mt-4">{subtitle}</p> : null}
        </header>
        <ul className="mp-reveal-stagger mp-editorial-list mt-12 divide-y divide-[var(--border-default)]">
          {items.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="df-reveal-stagger mp-list-row grid gap-6 py-10 lg:grid-cols-[4rem_1fr] lg:items-start"
            >
              <span className="mp-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <h3 className="mp-title-lg">{item.title}</h3>
                <p className="mp-body-sm mt-3 max-w-2xl">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
