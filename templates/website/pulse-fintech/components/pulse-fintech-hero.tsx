"use client";

const DEFAULT_TICKER = [
  { symbol: "USD/EUR", value: "0.9214", change: "+0.12%", up: true },
  { symbol: "BTC-PERP", value: "67,842", change: "+1.84%", up: true },
  { symbol: "SETTLE.LAG", value: "142ms", change: "-18ms", up: true },
  { symbol: "FX.VOLUME", value: "$4.2B", change: "+6.1%", up: true },
  { symbol: "RISK.SCORE", value: "0.18", change: "-0.03", up: true },
  { symbol: "ACH.FAIL", value: "0.04%", change: "+0.01%", up: false },
  { symbol: "WIRE.ETA", value: "00:42", change: "on-track", up: true },
  { symbol: "LIQ.DEPTH", value: "98.7%", change: "+0.4%", up: true },
];

const DEFAULT_FEED = [
  { time: "14:02:11", message: "Settlement batch #88421 cleared — 12,403 txs", tag: "OK" },
  { time: "14:01:48", message: "FX corridor EUR→SGD latency spike recovered", tag: "WARN→OK" },
  { time: "14:01:12", message: "Risk engine raised soft limit on merchant M-2291", tag: "WATCH" },
  { time: "14:00:55", message: "Webhook delivery backlog drained (p99 180ms)", tag: "OK" },
  { time: "14:00:21", message: "Liquidity desk rebalanced USD float +$18.4M", tag: "DESK" },
  { time: "13:59:58", message: "PCI scan window opened — east region", tag: "COMPLY" },
];

const CHART_BARS = [38, 52, 44, 61, 58, 73, 66, 81, 74, 88, 79, 94, 86, 91];

type TickerItem = { symbol: string; value: string; change: string; up?: boolean };
type FeedItem = { time: string; message: string; tag: string };

type PulseFintechHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  ticker?: TickerItem[];
  feed?: FeedItem[];
};

export function PulseFintechHero({
  title = "Move money at the speed of modern commerce",
  subtitle = "Real-time settlement, multi-currency rails, and compliance automation — one API for teams operating in 120+ markets.",
  eyebrow = "Global payments infrastructure",
  primaryCta = "Get API access",
  secondaryCta = "View documentation",
  ticker = DEFAULT_TICKER,
  feed = DEFAULT_FEED,
}: PulseFintechHeroProps) {
  const loop = [...ticker, ...ticker];

  return (
    <section id="top" data-v2-component="pulse-fintech-hero" aria-labelledby="pu-hero-title" className="pu-reveal bg-[var(--color-background)]">
      <div className="pu-ticker" aria-label="Live market ticker">
        <div className="pu-ticker-track">
          {loop.map((item, i) => (
            <span key={`${item.symbol}-${i}`} className="pu-ticker-item">
              <span className="pu-ticker-sym">{item.symbol}</span>
              <span>{item.value}</span>
              <span className={item.up === false ? "pu-ticker-down" : "pu-ticker-up"}>{item.change}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[96rem] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="pu-eyebrow flex items-center gap-2">
              <span className="pu-live-dot" aria-hidden />
              {eyebrow}
            </p>
            <h1 id="pu-hero-title" className="pu-headline mt-3">
              {title}
            </h1>
            <p className="pu-body mt-3 max-w-xl">{subtitle}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="#contact" className="pu-btn-primary pu-focus-ring">
                {primaryCta}
              </a>
              <a href="#features" className="pu-btn-secondary pu-focus-ring">
                {secondaryCta}
              </a>
            </div>
          </div>
          <p className="pu-font-mono text-xs text-[var(--color-muted)]">
            desk://payments · stream live
          </p>
        </div>

        <div className="pu-desk">
          <div className="pu-panel">
            <div className="pu-panel-head">
              <span>EVENT STREAM</span>
              <span className="inline-flex items-center gap-2">
                <span className="pu-live-dot" aria-hidden />
                LIVE
              </span>
            </div>
            <div className="pu-panel-body">
              <ul className="pu-feed">
                {feed.map((row) => (
                  <li key={`${row.time}-${row.message}`}>
                    <span className="pu-feed-time">{row.time}</span>
                    <span className="pu-feed-msg">{row.message}</span>
                    <span className="pu-feed-tag">{row.tag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pu-panel">
            <div className="pu-panel-head">
              <span>VOLUME · 15M</span>
              <span className="pu-ticker-up">+12.4%</span>
            </div>
            <div className="pu-panel-body">
              <div className="pu-chart" aria-hidden>
                {CHART_BARS.map((height, index) => (
                  <div
                    key={index}
                    className="pu-chart-bar"
                    style={{ height: `${height}%`, animationDelay: `${index * 0.04}s` }}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3 font-mono text-[0.6875rem]">
                <div>
                  <p className="text-[var(--color-muted)]">TPS</p>
                  <p className="pu-metric text-base">4,812</p>
                </div>
                <div>
                  <p className="text-[var(--color-muted)]">p99</p>
                  <p className="pu-metric text-base">142ms</p>
                </div>
                <div>
                  <p className="text-[var(--color-muted)]">FAIL</p>
                  <p className="pu-metric text-base">0.04%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
