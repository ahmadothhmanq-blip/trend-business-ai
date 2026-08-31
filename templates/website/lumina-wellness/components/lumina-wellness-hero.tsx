"use client";

type LuminaWellnessHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  brandName?: string;
  calmingLine?: string;
};

export function LuminaWellnessHero({
  title = "Lumina",
  subtitle,
  eyebrow = "Holistic wellness sanctuary",
  primaryCta = "Begin gently",
  secondaryCta,
  imageUrl = null,
  brandName,
  calmingLine = "Restore balance with rituals designed for modern life.",
}: LuminaWellnessHeroProps) {
  const brand = brandName ?? title;
  const line = calmingLine ?? subtitle ?? "Restore balance with rituals designed for modern life.";

  return (
    <section
      id="top"
      data-v2-component="lumina-wellness-hero"
      aria-labelledby="lu-hero-title"
      className="lu-atmosphere"
    >
      <span className="lu-orb lu-orb-a" aria-hidden />
      <span className="lu-orb lu-orb-b" aria-hidden />

      <div className="relative mx-auto max-w-2xl px-5 py-32 text-center sm:px-8 sm:py-40">
        <p className="lu-eyebrow">{eyebrow}</p>
        <h1 id="lu-hero-title" className="lu-headline mt-6">
          {brand}
        </h1>
        <p className="lu-body mx-auto mt-6 max-w-md text-lg">{line}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#contact" className="lu-btn-primary lu-focus-ring">
            {primaryCta}
          </a>
          {secondaryCta ? (
            <a href="#features" className="lu-btn-secondary lu-focus-ring">
              {secondaryCta}
            </a>
          ) : null}
        </div>

        {imageUrl ? (
          <figure className="mx-auto mt-14 max-w-sm overflow-hidden rounded-full">
            <img src={imageUrl} alt="" className="aspect-square h-auto w-full object-cover" />
          </figure>
        ) : null}
      </div>
    </section>
  );
}
