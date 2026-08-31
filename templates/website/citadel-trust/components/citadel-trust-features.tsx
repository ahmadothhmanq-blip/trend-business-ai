"use client";

const DEFAULT_FEATURES = [
  {
    title: "Litigation & arbitration",
    description: "Trial-ready teams for complex disputes in courts and tribunals worldwide.",
    icon: "Art. I",
  },
  {
    title: "Regulatory & compliance",
    description: "Navigate evolving policy landscapes with proactive counsel and government relations.",
    icon: "Art. II",
  },
  {
    title: "Corporate & M&A",
    description: "Transactions, governance, and capital markets for institutional clients.",
    icon: "Art. III",
  },
  {
    title: "Public affairs",
    description: "Strategic advocacy and reputation management at the intersection of law and policy.",
    icon: "Art. IV",
  },
  {
    title: "Investigations",
    description: "Internal investigations, white-collar defense, and regulatory inquiries.",
    icon: "Art. V",
  },
  {
    title: "International trade",
    description: "Sanctions, export controls, and cross-border regulatory frameworks.",
    icon: "Art. VI",
  },
];

type CitadelTrustFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string }>;
  charterTitle?: string;
};

export function CitadelTrustFeatures({
  eyebrow = "Firm charter",
  title = "Articles of practice",
  subtitle = "A stacked dossier of practice articles — not a grid of equal marketing cards.",
  items = DEFAULT_FEATURES,
  charterTitle = "Charter of engagement",
}: CitadelTrustFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="citadel-trust-features"
      aria-labelledby="ct-features-title"
      className="ct-dossier ct-section ct-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <header className="mb-8 max-w-2xl">
          <p className="ct-eyebrow">{eyebrow}</p>
          <h2 id="ct-features-title" className="ct-headline-sm mt-3">
            {title}
          </h2>
          <p className="ct-body mt-4">{subtitle}</p>
        </header>

        <div className="ct-doc">
          <p className="ct-doc-ribbon">
            <span className="ct-doc-seal-mark" aria-hidden />
            {charterTitle}
          </p>
          <div className="ct-reveal-stagger">
            {items.map((item, index) => (
              <article key={item.title} className="ct-article">
                <p className="ct-article-num">{item.icon ?? `Art. ${index + 1}`}</p>
                <h3 className="ct-article-title">{item.title}</h3>
                <p className="ct-body mt-2 text-base">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
