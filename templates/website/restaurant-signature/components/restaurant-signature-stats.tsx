"use client";

const DEFAULT_STATS = [
  {
    "value": "2",
    "label": "Michelin stars",
    "detail": "since 2022"
  },
  {
    "value": "48",
    "label": "Seat dining room",
    "detail": "intimate setting"
  },
  {
    "value": "12",
    "label": "Course tasting",
    "detail": "seasonal menu"
  },
  {
    "value": "96%",
    "label": "Return guests",
    "detail": "annual average"
  }
];

type RestaurantSignatureStatsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stats?: Array<{ value: string; label: string; detail?: string }>;
};

export function RestaurantSignatureStats({
  eyebrow = "Impact",
  title = "Numbers that matter",
  subtitle = "Measured across our global client base.",
  stats = DEFAULT_STATS,
}: RestaurantSignatureStatsProps) {
  return (
    <section id="stats" data-v2-component="restaurant-signature-stats" className="df-reveal py-20 sm:py-28 text-center">
      <h2 className="rs-headline-sm">{title}</h2>
      <dl className="df-reveal-stagger mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-[var(--color-surface)] p-8">
            <dd className="rs-metric text-3xl">{s.value}</dd>
            <dt className="mt-2 text-sm">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
