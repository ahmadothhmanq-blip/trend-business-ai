"use client";

type SaasEnterpriseUtilityBandProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function SaasEnterpriseUtilityBand({
  eyebrow = "Next step",
  title = "Provision a sandbox workspace",
  subtitle = "Spin up a trial org with sample pipeline data.",
  primaryCta = "Create sandbox",
  secondaryCta = "Talk to sales",
}: SaasEnterpriseUtilityBandProps) {
  return (
    <section
      id="cta-band"
      data-v2-component="saas-enterprise-utility-band"
      aria-labelledby="se-utility-title"
      className="se-utility se-reveal"
    >
      <div className="se-docs-inner se-utility-inner">
        <div>
          <p className="se-eyebrow">{eyebrow}</p>
          <h2 id="se-utility-title" className="se-headline-sm se-font-display">
            {title}
          </h2>
          <p className="se-body">{subtitle}</p>
        </div>
        <div className="se-utility-actions">
          <a href="#contact" className="se-btn-primary se-focus-ring">
            {primaryCta}
          </a>
          <a href="#pricing" className="se-btn-secondary se-focus-ring">
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
