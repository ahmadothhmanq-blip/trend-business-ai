"use client";

const DEFAULT_LOGOS = [
  { abbr: "AM", name: "Americas", category: "New York · Washington · São Paulo" },
  { abbr: "EU", name: "EMEA", category: "London · Brussels · Dubai" },
  { abbr: "AP", name: "APAC", category: "Singapore · Hong Kong · Tokyo" },
];

type CitadelTrustIntegrationsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ abbr: string; name: string; category: string }>;
};

export function CitadelTrustIntegrations({
  eyebrow = "Affiliations",
  title = "Global network seals",
  subtitle = "Regional charters and affiliations — presented as credential panels.",
  logos = DEFAULT_LOGOS,
}: CitadelTrustIntegrationsProps) {
  return (
    <section
      id="network"
      data-v2-component="citadel-trust-integrations"
      aria-labelledby="ct-network-title"
      className="ct-dossier ct-section ct-reveal"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="ct-doc">
          <p className="ct-doc-ribbon">
            <span className="ct-doc-seal-mark" aria-hidden />
            {eyebrow}
          </p>
          <h2 id="ct-network-title" className="ct-headline-sm">
            {title}
          </h2>
          <p className="ct-body mt-4">{subtitle}</p>
          <div className="ct-reveal-stagger mt-8 space-y-3">
            {logos.map((item) => (
              <div key={item.abbr} className="ct-attestation flex items-start gap-4">
                <div className="ct-attestation-seal shrink-0" aria-hidden>
                  {item.abbr}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="ct-body mt-1 text-sm">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
