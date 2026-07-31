import type { ThemePreviewContext } from "@/lib/website/theme-preview/types";
import { buildEliteVisualSystemCss } from "@/lib/website/theme-preview/elite-visual-system";
import { escapeHtml } from "@/lib/website/theme-preview/utils";

/** Base preview styles — theme presentation comes from scaffold Tailwind classes. */
export function buildThemePreviewStyles(
  ctx: ThemePreviewContext,
): string {
  const c = ctx.colors;
  const t = ctx.typography;

  return `
    :root {
      --color-primary: ${c.primary};
      --color-secondary: ${c.secondary};
      --color-accent: ${c.accent};
      --color-background: ${c.background};
      --color-foreground: ${c.foreground};
      --color-surface: ${c.surface};
      --color-primary-foreground: ${c.background};
      --font-display: ${escapeHtml(t.display)}, Georgia, serif;
      --font-heading: ${escapeHtml(t.heading)}, Georgia, serif;
      --font-body: ${escapeHtml(t.body)}, system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: var(--font-body);
      background: var(--color-background);
      color: var(--color-foreground);
      line-height: 1.55;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    img { max-width: 100%; height: auto; display: block; }
    a { color: inherit; text-decoration: none; }
    button { font: inherit; }
    ::selection {
      background: color-mix(in srgb, ${c.accent} 35%, transparent);
      color: ${c.foreground};
    }
    .page { display: none; padding-bottom: 2rem; }
    .page:target { display: block; }
    [data-theme-scaffold] {
      scroll-margin-top: 5rem;
    }
    [data-theme-scaffold]:target {
      animation: theme-section-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes theme-section-in {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      [data-theme-scaffold]:target { animation: none; }
    }
    [data-theme-scaffold-error] {
      display: none;
    }
    .ti-inner-page__main {
      min-height: 60vh;
    }
    .ti-inner-hero {
      padding: clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem);
      border-bottom: 1px solid color-mix(in srgb, ${c.foreground} 8%, transparent);
      background: linear-gradient(
        165deg,
        color-mix(in srgb, ${c.primary} 6%, ${c.background}) 0%,
        ${c.background} 55%
      );
    }
    .ti-inner-hero__shell {
      max-width: 52rem;
      margin: 0 auto;
    }
    .ti-inner-hero__eyebrow {
      margin: 0 0 1rem;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: color-mix(in srgb, ${c.accent} 85%, ${c.foreground});
    }
    .ti-inner-hero__title {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(2rem, 4.5vw, 3.25rem);
      font-weight: 400;
      line-height: 1.08;
      letter-spacing: -0.02em;
    }
    .ti-inner-hero__subtitle {
      margin: 1.25rem 0 0;
      max-width: 42rem;
      font-size: 1.05rem;
      line-height: 1.75;
      color: color-mix(in srgb, ${c.foreground} 62%, transparent);
    }
    .ti-inner-hero__page-label {
      display: none;
    }
    .ti-hero-cinematic [data-theme-scaffold="hero"] section,
    .ti-hero-cinematic section:first-of-type {
      min-height: 96svh;
    }
    .ti-hero-dark-authority {
      --color-background: #0a0a0b;
      --color-foreground: #f5f5f4;
      --color-surface: #141416;
    }
    .ti-hero-dashboard [data-theme-scaffold="hero"] .grid,
    .ti-hero-dashboard section:first-of-type .grid {
      gap: 2rem;
    }
    .ti-hero-editorial [data-theme-scaffold="hero"] h1,
    .ti-hero-editorial section:first-of-type h1 {
      font-size: clamp(2.75rem, 6vw, 5rem);
      letter-spacing: -0.03em;
    }
    .ti-hero-minimal [data-theme-scaffold="hero"] section,
    .ti-hero-minimal section:first-of-type {
      min-height: 72svh;
    }
    ${buildEliteVisualSystemCss(c)}
  `;
}

export function buildThemeRtlStyles(
  rtl: boolean,
  bodyFont: string,
  fontHint?: string | null,
): string {
  if (!rtl) return "";
  const fontStack = fontHint
    ? `${escapeHtml(fontHint)}, ${escapeHtml(bodyFont)}, system-ui, sans-serif`
    : `${escapeHtml(bodyFont)}, system-ui, sans-serif`;
  return `
    html[dir="rtl"] { direction: rtl; }
    html[dir="rtl"] body {
      text-align: right;
      font-family: ${fontStack};
    }
  `;
}
