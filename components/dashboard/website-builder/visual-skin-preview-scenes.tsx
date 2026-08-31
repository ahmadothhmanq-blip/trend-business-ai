"use client";

import type { VisualSkin } from "@/lib/website/visual-skin/types";

type SceneProps = {
  skin: VisualSkin;
};

/** Technology / glass-bento frame — sidebar rail, glow accents, dashboard hero. */
export function SovereignPreviewScene({ skin }: SceneProps) {
  const { tokens } = skin;
  const accent = tokens.accent;
  const bg = tokens.background;

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden"
      style={{ background: bg, color: tokens.foreground }}
    >
      <div
        className="pointer-events-none absolute -left-16 top-8 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute -right-8 bottom-0 h-32 w-32 rounded-full opacity-25 blur-2xl"
        style={{ background: tokens.primary }}
      />

      <div className="flex h-full">
        <aside
          className="flex w-9 shrink-0 flex-col items-center gap-1.5 border-r py-2"
          style={{ borderColor: `${tokens.foreground}14`, background: `${bg}ee` }}
        >
          <div
            className="flex size-6 items-center justify-center rounded-md font-mono text-[7px] font-bold"
            style={{
              border: `1px solid ${accent}55`,
              background: `${accent}18`,
              color: accent,
              boxShadow: `0 0 16px -4px ${accent}`,
            }}
          >
            AX
          </div>
          {["▦", "◈", "⬡", "◉"].map((icon) => (
            <div
              key={icon}
              className="flex size-6 items-center justify-center rounded-md text-[9px] opacity-55"
              style={{ border: `1px solid ${tokens.foreground}12`, background: `${tokens.foreground}06` }}
            >
              {icon}
            </div>
          ))}
        </aside>

        <div className="min-w-0 flex-1 p-2.5 sm:p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="h-2 w-14 rounded-full opacity-70" style={{ background: tokens.foreground }} />
            <div className="flex gap-1">
              <div
                className="h-4 rounded px-2 font-mono text-[6px] leading-4"
                style={{ border: `1px solid ${accent}44`, color: accent, background: `${accent}12` }}
              >
                live
              </div>
              <div
                className="h-4 rounded px-2 font-mono text-[6px] font-bold leading-4 text-black"
                style={{ background: accent, boxShadow: `0 0 12px -3px ${accent}` }}
              >
                Start
              </div>
            </div>
          </div>

          <div
            className="relative mb-2 overflow-hidden rounded-xl border p-2.5"
            style={{
              borderColor: `${tokens.foreground}10`,
              background: `linear-gradient(135deg, ${tokens.secondary} 0%, ${bg} 55%, ${tokens.primary}22 100%)`,
            }}
          >
            <p
              className="max-w-[14ch] text-[11px] font-semibold leading-tight tracking-tight"
              style={{ fontFamily: skin.typography.headingFont }}
            >
              Built for scale
            </p>
            <p className="mt-1 max-w-[20ch] text-[7px] leading-snug opacity-55">
              Glass surfaces, bento rhythm, cinematic depth.
            </p>
            <div
              className="absolute -right-2 top-1/2 h-14 w-14 -translate-y-1/2 rounded-lg border opacity-90"
              style={{
                borderColor: `${accent}33`,
                background: `linear-gradient(160deg, ${tokens.primary}55, ${bg})`,
                boxShadow: skin.shadows.md,
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[0.9, 0.65, 0.8].map((h, i) => (
              <div
                key={i}
                className="rounded-lg border"
                style={{
                  height: `${h}rem`,
                  borderColor: `${tokens.foreground}0c`,
                  background: `${tokens.foreground}05`,
                  boxShadow: i === 0 ? skin.shadows.sm : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Modern product-marketing frame — floating pill nav, mesh hero, floating card. */
export function PrestigePreviewScene({ skin }: SceneProps) {
  const { tokens } = skin;

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden"
      style={{ background: tokens.background, color: tokens.foreground }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 85% 15%, ${tokens.primary}22, transparent 55%),
            radial-gradient(ellipse 50% 40% at 10% 90%, ${tokens.accent}18, transparent 50%)
          `,
        }}
      />

      <div className="relative flex h-full flex-col p-2.5 sm:p-3">
        <div
          className="mx-auto mb-2 flex w-[88%] max-w-full items-center justify-between gap-2 rounded-full border px-2 py-1 shadow-lg backdrop-blur-md"
          style={{
            borderColor: `${tokens.foreground}12`,
            background: `${tokens.background}e8`,
            boxShadow: skin.shadows.sm,
          }}
        >
          <span className="text-[8px] font-semibold tracking-tight">Studio</span>
          <div
            className="hidden items-center gap-0.5 rounded-full px-1 py-0.5 sm:flex"
            style={{ background: `${tokens.foreground}06` }}
          >
            {["Work", "Pricing", "FAQ"].map((label) => (
              <span key={label} className="rounded-full px-1.5 text-[6px] opacity-55">
                {label}
              </span>
            ))}
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[6px] font-semibold"
            style={{ background: tokens.primary, color: tokens.background }}
          >
            Launch
          </span>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center gap-2">
          <div className="z-10 min-w-0 flex-1">
            <p
              className="text-[6px] font-medium uppercase tracking-[0.2em] opacity-45"
              style={{ color: tokens.primary }}
            >
              Product story
            </p>
            <p
              className="mt-1 max-w-[13ch] text-[11px] font-semibold leading-tight tracking-tight"
              style={{ fontFamily: skin.typography.headingFont }}
            >
              Editorial clarity
            </p>
            <p className="mt-1 max-w-[18ch] text-[7px] leading-snug opacity-50">
              Floating nav, mesh gradients, conversion rhythm.
            </p>
            <div className="mt-2 flex gap-1">
              <span
                className="rounded-full px-2 py-0.5 text-[6px] font-semibold"
                style={{ background: tokens.primary, color: tokens.background }}
              >
                Primary
              </span>
              <span
                className="rounded-full border px-2 py-0.5 text-[6px] opacity-70"
                style={{ borderColor: `${tokens.foreground}18` }}
              >
                Tour
              </span>
            </div>
          </div>

          <div
            className="relative h-[72%] w-[38%] shrink-0 overflow-hidden rounded-xl border"
            style={{
              borderColor: `${tokens.foreground}10`,
              background: `linear-gradient(180deg, ${tokens.secondary}18, ${tokens.background})`,
              boxShadow: skin.shadows.lg,
              borderRadius: tokens.radius,
            }}
          >
            <div
              className="absolute inset-x-2 top-2 h-[45%] rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
                opacity: 0.85,
              }}
            />
            <div className="absolute inset-x-2 bottom-2 space-y-1">
              <div className="h-1 w-3/4 rounded-full opacity-25" style={{ background: tokens.foreground }} />
              <div className="h-1 w-1/2 rounded-full opacity-15" style={{ background: tokens.foreground }} />
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-1">
          {[tokens.primary, tokens.accent, tokens.secondary].map((color, i) => (
            <div
              key={i}
              className="h-1 rounded-full"
              style={{ background: color, opacity: i === 2 ? 0.35 : 0.75 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Azure Haven — dark editorial frame aligned with hotel-resort-premium. */
export function HavenPreviewScene({ skin }: SceneProps) {
  const { tokens } = skin;
  const azure = tokens.accent;

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden"
      style={{ background: tokens.background, color: tokens.foreground }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% -10%, color-mix(in srgb, ${azure} 22%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative flex h-full flex-col p-2.5 sm:p-3">
        <div
          className="mb-2 flex items-center justify-between border px-2 py-1"
          style={{ borderColor: `${tokens.foreground}14`, background: `${tokens.primary}cc` }}
        >
          <span className="text-[8px] opacity-90" style={{ fontFamily: skin.typography.headingFont }}>
            Brand
          </span>
          <span
            className="px-2 py-0.5 text-[6px] uppercase tracking-[0.18em]"
            style={{ background: azure, color: tokens.background }}
          >
            CTA
          </span>
        </div>
        <div className="grid flex-1 gap-2 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-w-0">
            <p className="text-[6px] uppercase tracking-[0.22em] opacity-60" style={{ color: azure }}>
              Welcome
            </p>
            <p
              className="mt-1 max-w-[12ch] text-[11px] leading-tight"
              style={{ fontFamily: skin.typography.headingFont }}
            >
              Build something remarkable
            </p>
            <p className="mt-1 max-w-[18ch] text-[6px] leading-snug opacity-55">
              Clear story, strong offer, thoughtful design.
            </p>
          </div>
          <div
            className="border p-1.5"
            style={{ borderColor: `${azure}22`, background: `${tokens.secondary}88` }}
          >
            <div className="grid grid-cols-2 gap-1">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-3 border" style={{ borderColor: `${tokens.foreground}10`, background: `${tokens.background}55` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 h-px w-10" style={{ background: `linear-gradient(90deg, ${azure}, transparent)` }} />
      </div>
    </div>
  );
}

export function VisualSkinPreviewScene({ skinId, skin }: { skinId: string; skin: VisualSkin }) {
  if (skinId === "prestige") return <PrestigePreviewScene skin={skin} />;
  return <SovereignPreviewScene skin={skin} />;
}
