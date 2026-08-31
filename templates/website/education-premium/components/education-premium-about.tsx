"use client";

const DEFAULT_HIGHLIGHTS = [
  "Founded for scholarship that serves the public good",
  "A living campus of libraries, labs, and studios",
  "Alumni who lead across continents and disciplines",
];

type EducationPremiumAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function EducationPremiumAbout({
  eyebrow = "From the editors",
  title = "An essay on belonging and ambition",
  subtitle,
  body = "We began with a simple belief: serious learning deserves a setting that respects both tradition and invention. Today our community gathers scholars, practitioners, and students who treat education as a lifelong craft — measured not only in degrees conferred, but in the clarity of thought they carry into the world.",
  imageUrl = null,
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Meet the faculty",
}: EducationPremiumAboutProps) {
  return (
    <section
      id="about"
      data-v2-component="education-premium-about"
      aria-labelledby="ed-about-title"
      className="ed-essay ed-paper ed-reveal"
    >
      <div className="ed-essay-inner">
        <header className="ed-essay-head">
          <p className="ed-eyebrow">{eyebrow}</p>
          <h2 id="ed-about-title" className="ed-headline-sm ed-font-display">
            {title}
          </h2>
          {subtitle ? <p className="ed-body ed-essay-deck">{subtitle}</p> : null}
        </header>

        <div className="ed-essay-layout">
          <div className="ed-essay-prose">
            <p className="ed-essay-dropcap ed-body">{body}</p>
            <ul className="ed-essay-notes ed-reveal-stagger">
              {highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <a href="#contact" className="ed-btn-secondary ed-focus-ring">
              {primaryCta}
            </a>
          </div>

          {imageUrl ? (
            <figure className="ed-essay-figure">
              <img src={imageUrl} alt="" className="ed-essay-image" />
              <figcaption>Portrait of the academic commons</figcaption>
            </figure>
          ) : (
            <aside className="ed-essay-aside" aria-hidden>
              <p className="ed-font-display">“Learning is a public trust.”</p>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
