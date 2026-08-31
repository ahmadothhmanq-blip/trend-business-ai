"use client";

const DEFAULT_LOGOS = [
  { abbr: "01", name: "Thermal suite", category: "Environment" },
  { abbr: "02", name: "Movement studio", category: "Practice" },
  { abbr: "03", name: "Clinical wing", category: "Care" },
  { abbr: "04", name: "Nutrition atelier", category: "Nourish" },
];

type LuminaWellnessIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function LuminaWellnessIntegrations({
  eyebrow = "House spaces",
  title = "Rooms that hold the ritual",
  subtitle = "Soft references to environments — never a logo wall.",
  logos = DEFAULT_LOGOS,
}: LuminaWellnessIntegrationsProps) {
  return (
    <section
      id="platform"
      data-v2-component="lumina-wellness-integrations"
      aria-labelledby="lu-integrations-title"
      className="lu-section lu-reveal"
    >
      <div className="mx-auto max-w-xl px-5 text-center sm:px-8">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h2 id="lu-integrations-title" className="lu-headline-sm mt-4">
          {title}
        </h2>
        <p className="lu-body mx-auto mt-4 max-w-md">{subtitle}</p>
      </div>
      <div className="lu-ritual lu-reveal-stagger mt-4 px-5 sm:px-8" role="list">
        {logos.map((item) => (
          <div key={item.abbr} className="lu-ritual-step" role="listitem">
            <p className="lu-ritual-index" aria-hidden>
              {item.abbr}
            </p>
            <p className="lu-ritual-title">{item.name}</p>
            <p className="lu-body mt-2 text-sm">{item.category}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
