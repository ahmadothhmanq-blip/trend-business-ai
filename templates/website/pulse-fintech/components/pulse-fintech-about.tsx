"use client";

const DEFAULT_HIGHLIGHTS = [
  "Founded by industry veterans with global experience",
  "Trusted by organizations across 40+ countries",
  "Committed to measurable outcomes and long-term partnerships",
];

type PulseFintechAboutProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  highlights?: string[];
  primaryCta?: string;
};

export function PulseFintechAbout({
  eyebrow = "Origin",
  title = "Built on trading-floor discipline",
  body = "Pulse began as an internal settlement mesh for multi-market desks. Today it powers real-time money movement for platforms that cannot tolerate opaque latency or compliance theatre.",
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "Talk to payments eng",
}: PulseFintechAboutProps) {
  return (
    <section id="about" data-v2-component="pulse-fintech-about" className="pu-reveal pu-section px-4 sm:px-6">
      <div className="pu-desk mx-auto max-w-[96rem]">
        <div className="pu-panel">
          <div className="pu-panel-head">
            <span>ABOUT // PULSE</span>
            <span className="inline-flex items-center gap-2">
              <span className="pu-live-dot" aria-hidden />
              SYS.OK
            </span>
          </div>
          <div className="pu-panel-body">
            <p className="pu-eyebrow">{eyebrow}</p>
            <h2 className="pu-headline-sm mt-2">{title}</h2>
            <p className="pu-body mt-4 max-w-2xl">{body}</p>
            <a href="#contact" className="pu-btn-primary pu-focus-ring mt-6">
              {primaryCta}
            </a>
          </div>
        </div>
        <div className="pu-panel">
          <div className="pu-panel-head">
            <span>SIGNAL LOG</span>
            <span>{highlights.length}</span>
          </div>
          <ul className="pu-feed pu-panel-body">
            {highlights.map((item, i) => (
              <li key={item}>
                <span className="pu-feed-time">{String(i + 1).padStart(2, "0")}</span>
                <span className="pu-feed-msg">{item}</span>
                <span className="pu-feed-tag">NOTE</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
