"use client";

const DEFAULT_FEATURES = [
  { title: "Core offering", description: "The primary value you deliver — explained clearly and confidently." },
  { title: "Expert support", description: "Guidance, onboarding, and partnership from first conversation onward." },
  { title: "Proven outcomes", description: "Results your clients can measure and trust over time." },
  { title: "Flexible engagement", description: "Options that adapt to scope, timeline, and budget." },
];

type FeatureItem = { title: string; description: string; icon?: string };

type HotelResortPremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
};

export function HotelResortPremiumFeatures({
  eyebrow = "What we offer",
  title = "Capabilities built around your goals",
  subtitle = "Clear value propositions presented with structure and craft.",
  items = DEFAULT_FEATURES,
}: HotelResortPremiumFeaturesProps) {
  if (!items.length) return null;

  return (
    <section
      id="features"
      data-v2-component="hotel-resort-premium-features"
      aria-labelledby="hr-features-title"
      className="hr-reveal hr-section hr-section-glow"
    >
      <div className="hr-container">
        <header className="hr-section-header hr-section-header--rule hr-section-header--center mx-auto text-center">
          {eyebrow ? <p className="hr-eyebrow">{eyebrow}</p> : null}
          <h2 id="hr-features-title" className="hr-headline-sm mt-4">
            {title}
          </h2>
          <div className="hr-azure-rule mx-auto" />
          {subtitle ? <p className="hr-body mx-auto mt-4 max-w-xl">{subtitle}</p> : null}
        </header>
        <ul className="hr-reveal-stagger mt-14 grid gap-5 sm:grid-cols-2">
          {items.map((item, index) => (
            <li key={`${item.title}-${index}`} className="hr-feature-card">
              <span className="hr-feature-icon" aria-hidden>
                {item.icon ?? String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="hr-title-lg">{item.title}</h3>
              <p className="hr-body-sm mt-3">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
