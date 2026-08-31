"use client";

const DEFAULT_FEATURES = [
  {
    title: "Leather capsule",
    description: "Vegetable-tanned pieces cut in small atelier runs.",
    icon: "01",
    span: "hero",
  },
  {
    title: "Soft tailoring",
    description: "Relaxed structure with gallery-clean lines.",
    icon: "02",
    span: "tall",
  },
  {
    title: "Home objects",
    description: "Stone, timber, and linen for considered rooms.",
    icon: "03",
    span: "compact",
  },
  {
    title: "Archive editions",
    description: "Numbered drops released once per season.",
    icon: "04",
    span: "wide",
  },
];

type EcommercePremiumFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string; imageUrl?: string | null }>;
};

export function EcommercePremiumFeatures({
  eyebrow = "Lookbook",
  title = "Season filmstrip",
  subtitle = "Scroll the runway — chapters, not cards.",
  items = DEFAULT_FEATURES,
}: EcommercePremiumFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="ecommerce-premium-features"
      aria-labelledby="ec-features-title"
      className="ec-lookbook ec-reveal"
    >
      <div className="ec-lookbook-head">
        <p className="ec-eyebrow">{eyebrow}</p>
        <h2 id="ec-features-title" className="ec-headline-sm ec-font-display">
          {title}
        </h2>
        <p className="ec-body">{subtitle}</p>
      </div>

      <div className="ec-lookbook-strip" tabIndex={0} role="list" aria-label="Lookbook frames">
        {items.map((item, i) => (
          <article key={item.title} className="ec-lookbook-frame" role="listitem">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" className="ec-lookbook-media" />
            ) : (
              <div className="ec-lookbook-media is-tonal" aria-hidden>
                <span className="ec-font-mono">{item.icon ?? String(i + 1).padStart(2, "0")}</span>
              </div>
            )}
            <div className="ec-lookbook-caption">
              <h3 className="ec-font-display">{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
