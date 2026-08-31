"use client";

type ObsidianNoirHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  brandName?: string;
};

export function ObsidianNoirHero({
  title = "Craft preserved for generations",
  subtitle,
  brandName = "Obsidian",
}: ObsidianNoirHeroProps) {
  const sentence = subtitle?.trim() || title;

  return (
    <section id="top" data-v2-component="obsidian-noir-hero" aria-labelledby="ob-hero-title" className="ob-reveal ob-manifesto-shell bg-[var(--color-background)]">
      <div className="mx-auto w-full max-w-[72rem]">
        <h1 id="ob-hero-title" className="ob-wordmark">
          {brandName}
        </h1>
        <p className="ob-sentence mt-8 sm:mt-10">{sentence}</p>
      </div>
    </section>
  );
}
