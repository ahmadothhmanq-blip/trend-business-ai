"use client";

const DEFAULT_HIGHLIGHTS = [
  "Founded by industry veterans with global experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

type ObsidianNoirAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function ObsidianNoirAbout({
  eyebrow = "About",
  title = "A maison defined by what it refuses",
  body = "We started with a simple belief: world-class craft deserves partners that match its patience. Today we preserve collections, commissions, and private viewing rituals for clients who value permanence over noise.",
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Request introduction",
}: ObsidianNoirAboutProps) {
  return (
    <section id="about" data-v2-component="obsidian-noir-about" className="ob-reveal ob-section px-5 sm:px-8">
      <div className="mx-auto max-w-[72rem]">
        <hr className="ob-rule mb-16" />
        <p className="ob-eyebrow">{eyebrow}</p>
        <h2 className="ob-headline-sm mt-6 max-w-[14ch]">{title}</h2>
        <p className="ob-body mt-10 max-w-2xl text-lg">{body}</p>
        <ul className="ob-reveal-stagger mt-16 max-w-2xl space-y-8">
          {highlights.map((item) => (
            <li key={item} className="border-t border-[var(--border-default)] pt-6">
              <p className="ob-font-display text-xl text-[var(--color-foreground)] sm:text-2xl">{item}</p>
            </li>
          ))}
        </ul>
        <a href="#contact" className="ob-btn-primary ob-focus-ring mt-14">
          {primaryCta}
        </a>
      </div>
    </section>
  );
}
