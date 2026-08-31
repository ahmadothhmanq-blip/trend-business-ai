"use client";

const DEFAULT_FEATURES = [
  {
    title: "Real-time settlement",
    description: "Clear domestic and cross-border batches with sub-second confirmation streams.",
    icon: "01",
  },
  {
    title: "Multi-currency rails",
    description: "Route FX with depth-aware pricing and corridor-level latency budgets.",
    icon: "02",
  },
  {
    title: "Compliance automation",
    description: "Map SOC 2, PCI, and jurisdiction policies into enforceable control planes.",
    icon: "03",
  },
  {
    title: "Fraud telemetry",
    description: "Stream risk scores into desks with soft limits, hard blocks, and audit trails.",
    icon: "04",
  },
];

type PulseFintechFeaturesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; description: string; icon?: string; span?: string }>;
};

export function PulseFintechFeatures({
  eyebrow = "Rails",
  title = "Infrastructure that reads like a desk",
  subtitle = "Dense controls for teams that move money every second.",
  items = DEFAULT_FEATURES,
}: PulseFintechFeaturesProps) {
  return (
    <section id="features" data-v2-component="pulse-fintech-features" aria-labelledby="pu-features-title" className="pu-reveal pu-section px-4 sm:px-6">
      <div className="mx-auto max-w-[96rem]">
        <p className="pu-eyebrow">{eyebrow}</p>
        <h2 id="pu-features-title" className="pu-headline-sm mt-1">
          {title}
        </h2>
        <p className="pu-body mt-2 max-w-xl">{subtitle}</p>
        <div className="pu-panel mt-6">
          <div className="pu-panel-head">
            <span>MODULE INDEX</span>
            <span>4 ACTIVE</span>
          </div>
          <table className="pu-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Module</th>
                <th scope="col">Capability</th>
              </tr>
            </thead>
            <tbody className="pu-reveal-stagger">
              {items.map((item) => (
                <tr key={item.title}>
                  <td className="text-[var(--color-accent)]">{item.icon ?? "—"}</td>
                  <td className="font-semibold text-[var(--color-foreground)]">{item.title}</td>
                  <td className="text-[var(--color-muted)]">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
