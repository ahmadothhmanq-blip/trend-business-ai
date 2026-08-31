"use client";

const DEFAULT_HIGHLIGHTS = [
  {
    title: "Model routing at scale",
    body: "Latency-aware policies across providers with automatic failover at the edge.",
  },
  {
    title: "Unified observability",
    body: "Trace every request, token, and deployment across your AI stack in one timeline.",
  },
  {
    title: "Secure by design",
    body: "SOC 2, GDPR, and HIPAA-ready controls with audit trails on every action.",
  },
];

type AiStartupSignalAboutProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  highlights?: Array<{ title: string; body: string }>;
  primaryCta?: string;
};

export function AiStartupSignalAbout({
  eyebrow = "Our mission",
  title = "Infrastructure for teams shipping intelligence",
  body = "Signal was built for product and platform teams who need AI operations that match the rigor of their core systems — routing, observability, and secure deployment without rebuilding your stack.",
  highlights = DEFAULT_HIGHLIGHTS,
  primaryCta = "View architecture",
}: AiStartupSignalAboutProps) {
  return (
    <section id="about" data-v2-component="ai-startup-signal-about" aria-labelledby="as-about-title" className="df-reveal py-20 sm:py-28">
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="df-reveal-stagger grid gap-14 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="as-eyebrow mb-3">{eyebrow}</p>
            <h2 id="as-about-title" className="as-headline-sm">{title}</h2>
            <p className="as-body mt-6 max-w-xl text-[var(--color-muted)]">{body}</p>
            <a href="#platform" className="as-btn-secondary as-focus-ring mt-8 inline-flex">{primaryCta}</a>
          </div>
          <ul className="space-y-4">
            {highlights.map((item, i) => (
              <li
                key={typeof item === "string" ? item : item.title}
                className="as-glass-card group rounded-xl border border-[var(--border-signal)] p-6 transition-colors hover:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
              >
                <span className="as-font-mono text-xs text-[var(--color-signal)]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
