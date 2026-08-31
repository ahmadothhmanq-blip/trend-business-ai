"use client";

const DEFAULT_HIGHLIGHTS = [
  "Foraged within a day of service",
  "Hearth as the kitchen’s only fire",
  "Growers named on every bottle",
];

type RestaurantSignatureAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function RestaurantSignatureAbout({
  eyebrow = "From the chef",
  title = "A kitchen rooted in place",
  subtitle,
  body = "We cook what the forest and farms allow each week. The tasting menu is rewritten with the weather — never as a fixed catalogue of dishes.",
  imageUrl,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Reserve",
}: RestaurantSignatureAboutProps) {
  return (
    <section
      id="about"
      data-v2-component="restaurant-signature-about"
      className="rs-menu-doc rs-reveal"
      style={{ paddingTop: "0", borderTop: "0" }}
    >
      <div className="rs-menu-essay">
        <p className="rs-menu-section-label">{eyebrow}</p>
        <h2>{title}</h2>
        {subtitle ? <p className="mb-4">{subtitle}</p> : null}
        <p>{body}</p>
        <ul className="mx-auto mt-8 max-w-md space-y-2 text-start text-sm text-[color-mix(in_srgb,var(--color-foreground)_65%,transparent)]">
          {highlights.map((h) => (
            <li key={h} className="border-b border-[color-mix(in_srgb,var(--color-copper)_16%,transparent)] py-2">
              {h}
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <a href="#contact" className="rs-btn-ghost inline-flex">
            {primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
