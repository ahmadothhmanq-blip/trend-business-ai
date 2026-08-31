"use client";

type CitadelTrustHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  sealLabel?: string;
  firmName?: string;
  credentialLine?: string;
};

export function CitadelTrustHero({
  title = "Citadel",
  subtitle,
  eyebrow = "Institutional counsel",
  primaryCta = "Engage our firm",
  secondaryCta = "Read the charter",
  imageUrl = null,
  sealLabel = "Est.\n1892",
  firmName,
  credentialLine = "Admitted across leading jurisdictions · Trusted by boards, governments, and sovereign institutions",
}: CitadelTrustHeroProps) {
  const displayName = firmName ?? title;
  const sealLines = String(sealLabel ?? "Est.\n1892")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section
      id="top"
      data-v2-component="citadel-trust-hero"
      aria-labelledby="ct-hero-title"
      className="ct-dossier ct-section"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <div className="ct-seal" aria-hidden>
          <div className="ct-seal-inner">
            {sealLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>

        <p className="ct-eyebrow mt-8">{eyebrow}</p>
        <h1 id="ct-hero-title" className="ct-headline mt-4">
          {displayName}
        </h1>
        <p className="ct-credential mx-auto mt-5 max-w-xl">{credentialLine}</p>
        {subtitle ? <p className="ct-body mx-auto mt-4 max-w-xl">{subtitle}</p> : null}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#contact" className="ct-btn-primary ct-focus-ring">
            {primaryCta}
          </a>
          <a href="#features" className="ct-btn-secondary ct-focus-ring">
            {secondaryCta}
          </a>
        </div>

        {imageUrl ? (
          <figure className="mx-auto mt-12 max-w-md border border-[var(--border-default)] bg-[var(--color-surface)] p-3">
            <img src={imageUrl} alt="" className="h-auto w-full object-cover" />
            <figcaption className="ct-font-mono mt-2 text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">
              Firm seal archive
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
