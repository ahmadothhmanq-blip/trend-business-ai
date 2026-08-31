"use client";

const DEFAULT_FEATURES = [
  {
    title: "Clinical aesthetics",
    description: "Evidence-based treatments administered by board-certified specialists.",
    icon: "01",
  },
  {
    title: "Movement therapy",
    description: "Personalized programs integrating Pilates, yoga, and recovery science.",
    icon: "02",
  },
  {
    title: "Nutrition programs",
    description: "Metabolic assessments and chef-curated meal plans for lasting results.",
    icon: "03",
  },
  {
    title: "Mind-body rituals",
    description: "Meditation, breathwork, and thermal experiences for deep restoration.",
    icon: "04",
  },
];

type LuminaWellnessFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function LuminaWellnessFeatures({
  eyebrow = "Ritual sequence",
  title = "A quiet path to balance",
  subtitle = "Each step arrives with space to breathe — never a crowded card grid.",
  items = DEFAULT_FEATURES,
}: LuminaWellnessFeaturesProps) {
  return (
    <section
      id="features"
      data-v2-component="lumina-wellness-features"
      aria-labelledby="lu-features-title"
      className="lu-section lu-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h2 id="lu-features-title" className="lu-headline-sm mt-4">
          {title}
        </h2>
        <p className="lu-body mx-auto mt-5 max-w-md">{subtitle}</p>
      </div>

      <div className="lu-ritual lu-reveal-stagger mt-6 px-5 sm:px-8" role="list">
        {items.map((item, index) => (
          <article key={item.title} className="lu-ritual-step" role="listitem">
            <p className="lu-ritual-index" aria-hidden>
              {item.icon ?? String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="lu-ritual-title">{item.title}</h3>
            <p className="lu-body mx-auto mt-3 max-w-sm text-base">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
