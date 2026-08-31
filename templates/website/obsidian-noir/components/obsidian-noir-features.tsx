"use client";

const DEFAULT_FEATURES = [
  {
    title: "Restraint is the luxury",
    description: "We remove until only permanence remains — every line earned, every surface intentional.",
    icon: "01",
  },
  {
    title: "Heritage without nostalgia",
    description: "Techniques carried forward, never costume. The past informs craft; it does not decorate it.",
    icon: "02",
  },
  {
    title: "Private by design",
    description: "Access is quiet. Collections arrive through invitation, conversation, and lasting relationship.",
    icon: "03",
  },
  {
    title: "Built to outlast seasons",
    description: "Materials, finishing, and service cadence chosen for decades — not campaigns.",
    icon: "04",
  },
];

type ObsidianNoirFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function ObsidianNoirFeatures({
  eyebrow = "Manifesto",
  title = "Four theses",
  subtitle = "Sparse principles that govern every collection and commission.",
  items = DEFAULT_FEATURES,
}: ObsidianNoirFeaturesProps) {
  return (
    <section id="features" data-v2-component="obsidian-noir-features" aria-labelledby="ob-features-title" className="ob-reveal ob-section px-5 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <p className="ob-eyebrow">{eyebrow}</p>
        <h2 id="ob-features-title" className="ob-headline-sm mt-4">
          {title}
        </h2>
        <p className="ob-body mt-4 max-w-xl">{subtitle}</p>
        <hr className="ob-rule mt-12" />
        <ol className="ob-reveal-stagger mt-0">
          {items.map((item, index) => (
            <li key={item.title} className="grid gap-6 border-b border-[var(--border-default)] py-12 md:grid-cols-[7rem_1fr] md:gap-12">
              <span className="ob-thesis-num" aria-hidden>
                {item.icon ?? String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="ob-thesis-title">{item.title}</h3>
                <p className="ob-body mt-4 max-w-2xl">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
