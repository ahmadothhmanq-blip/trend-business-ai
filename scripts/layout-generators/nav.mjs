import { DEFAULT_NAV_LINKS } from "../layout-dna.mjs";
import { NAV_HOOKS, MOBILE_NAV_HOOKS, NAV_SKIP_LINK, hamburgerButton, mobileMenu, navPropsType } from "./shared.mjs";

/** @type {Record<string, (ctx: { p: string; pkg: string; Pascal: string }) => string>} */
export const NAV_GENERATORS = {
  "product-glass": productGlass,
  "creative-minimal": creativeMinimal,
  "editorial-underline": editorialUnderline,
  "corporate-classic": corporateClassic,
  "luxury-transparent": luxuryTransparent,
  "minimal-pill": minimalPill,
  "resort-floating": resortFloating,
  "warm-bordered": warmBordered,
  "academic-split": academicSplit,
  "shop-minimal": shopMinimal,
  "product-tabs": productTabs,
  "portfolio-center": portfolioCenter,
  "floating-pill": floatingPill,
  "dark-compact": darkCompact,
  "terminal-bar": terminalBar,
  "industrial-bold": industrialBold,
  "law-classic": lawClassic,
  "wellness-soft": wellnessSoft,
};

export function generateNav(entry, layoutKey) {
  const fn = NAV_GENERATORS[layoutKey] ?? productGlass;
  return fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
}

function navHeader({ p, pkg, Pascal }) {
  return `${NAV_HOOKS}

const DEFAULT_LINKS = ${JSON.stringify(DEFAULT_NAV_LINKS, null, 2)};

${navPropsType(Pascal)}

export function ${Pascal}Nav({
  brandName = "Your Company",
  ctaLabel = "Get started",
  links = DEFAULT_LINKS,
}: ${Pascal}NavProps) {${MOBILE_NAV_HOOKS}`;
}

function productGlass({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className={["sticky top-0 z-50 border-b transition-all", scrolled ? "border-[var(--border-default)] bg-[var(--color-surface)]/90 backdrop-blur-xl" : "border-transparent bg-[var(--color-background)]/80 backdrop-blur-md"].join(" ")}>
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-16 max-w-[82rem] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="${p}-font-display font-bold ${p}-focus-ring">{brandName}</a>
        <nav aria-label="Primary" className="hidden gap-8 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)]">{l.label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="${p}-btn-primary hidden sm:inline-flex">{ctaLabel}</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function creativeMinimal({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className={["sticky top-0 z-50 transition-all", scrolled ? "bg-[var(--color-background)]" : "bg-transparent"].join(" ")}>
${NAV_SKIP_LINK}
      <div className="mx-auto grid h-20 max-w-[88rem] grid-cols-3 items-center px-5 sm:px-8">
        <a href="#top" className="${p}-font-display text-lg font-bold">{brandName}</a>
        <nav aria-label="Primary" className="hidden justify-center gap-10 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-xs font-semibold uppercase tracking-widest">{l.label}</a>)}
        </nav>
        <div className="flex justify-end gap-2">
          <a href="#contact" className="${p}-btn-volt hidden sm:inline-flex">{ctaLabel}</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function editorialUnderline({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="sticky top-0 z-50 border-b border-[var(--border-default)] bg-[var(--color-background)]">
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-[4.5rem] max-w-[82rem] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="${p}-font-display text-base font-semibold tracking-tight">{brandName}</a>
        <nav aria-label="Primary" className="hidden gap-10 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="group relative text-sm"><span>{l.label}</span><span className="absolute -bottom-1 start-0 h-px w-0 bg-[var(--color-accent)] transition-all group-hover:w-full" /></a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#contact" className="${p}-btn-primary hidden sm:inline-flex">{ctaLabel}</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function corporateClassic({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className={["sticky top-0 z-50 border-b", scrolled ? "border-[var(--border-default)] bg-[var(--color-surface)] shadow-sm" : "border-transparent bg-[var(--color-background)]"].join(" ")}>
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-8 px-5 sm:px-8 lg:h-[4.25rem]">
        <a href="#top" className="flex items-center gap-2 ${p}-font-display font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-primary)] text-xs text-white" aria-hidden>C</span>
          {brandName}
        </a>
        <nav aria-label="Primary" className="hidden flex-1 justify-center gap-8 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm font-medium text-[var(--color-muted)]">{l.label}</a>)}
        </nav>
        <a href="#contact" className="${p}-btn-primary hidden sm:inline-flex">{ctaLabel}</a>
        ${hamburgerButton({ p, id: mobileId })}
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function luxuryTransparent({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-[var(--color-background)]/80 to-transparent">
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-20 max-w-[88rem] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="${p}-font-display text-lg tracking-[0.2em] uppercase">{brandName}</a>
        <nav aria-label="Primary" className="hidden gap-10 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm tracking-wide text-[var(--color-foreground)]/80">{l.label}</a>)}
        </nav>
        <div className="flex gap-2">
          <a href="#contact" className="${p}-btn-secondary hidden sm:inline-flex">{ctaLabel}</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function minimalPill({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="sticky top-0 z-50 px-5 py-4 sm:px-8">
      <div className={["mx-auto flex max-w-3xl items-center justify-between rounded-full border px-6 py-3 transition-all", scrolled ? "border-[var(--border-default)] bg-[var(--color-surface)]/95 shadow-sm backdrop-blur" : "border-[var(--border-subtle)] bg-[var(--color-surface)]/70 backdrop-blur"].join(" ")}>
        <a href="#top" className="text-sm font-semibold">{brandName}</a>
        <nav aria-label="Primary" className="hidden gap-6 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm text-[var(--color-muted)]">{l.label}</a>)}
        </nav>
        <div className="flex gap-2">
          <a href="#contact" className="${p}-btn-primary !rounded-full !px-4 !py-2 text-xs hidden sm:inline-flex">{ctaLabel}</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function resortFloating({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="fixed inset-x-0 top-6 z-50 px-5 sm:px-8">
${NAV_SKIP_LINK}
      <div className="mx-auto flex max-w-4xl items-center justify-between rounded-2xl bg-[var(--color-surface)]/75 px-6 py-3 shadow-lg backdrop-blur-xl">
        <a href="#top" className="${p}-font-display font-semibold">{brandName}</a>
        <nav aria-label="Primary" className="hidden gap-8 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm">{l.label}</a>)}
        </nav>
        <div className="flex gap-2">
          <a href="#contact" className="${p}-btn-primary text-sm hidden sm:inline-flex">{ctaLabel}</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function warmBordered({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="border-b-2 border-[var(--color-accent)]/30 bg-[var(--color-background)]">
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-16 max-w-[82rem] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="${p}-font-display font-bold text-[var(--color-accent)]">{brandName}</a>
        <nav aria-label="Primary" className="hidden gap-6 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm font-medium">{l.label}</a>)}
        </nav>
        <div className="flex gap-2">
          <a href="#contact" className="${p}-btn-primary hidden sm:inline-flex">{ctaLabel}</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function academicSplit({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="border-b border-[var(--border-default)] bg-[var(--color-surface)]">
${NAV_SKIP_LINK}
      <div className="mx-auto grid max-w-[88rem] grid-cols-2 items-center px-5 py-4 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <nav aria-label="Primary left" className="hidden gap-6 lg:flex">
          {links.slice(0, 2).map((l) => <a key={l.href} href={l.href} className="text-sm">{l.label}</a>)}
        </nav>
        <a href="#top" className="text-center ${p}-font-display text-lg font-bold lg:col-start-2">{brandName}</a>
        <div className="flex items-center justify-end gap-4">
          <nav aria-label="Primary right" className="hidden gap-6 lg:flex">
            {links.slice(2).map((l) => <a key={l.href} href={l.href} className="text-sm">{l.label}</a>)}
          </nav>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function shopMinimal({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="sticky top-0 z-50 bg-[var(--color-background)]">
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-14 max-w-[88rem] items-center justify-between border-b border-[var(--border-subtle)] px-5 sm:px-8">
        <a href="#top" className="text-sm font-bold tracking-[0.3em] uppercase">{brandName}</a>
        <nav aria-label="Primary" className="hidden gap-12 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-xs uppercase tracking-widest">{l.label}</a>)}
        </nav>
        <a href="#contact" className="text-sm underline-offset-4 hover:underline">{ctaLabel}</a>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function productTabs({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="sticky top-0 z-50 border-b border-[var(--border-default)] bg-[var(--color-background)]">
${NAV_SKIP_LINK}
      <div className="mx-auto max-w-[82rem] px-5 sm:px-8">
        <div className="flex h-14 items-center justify-between">
          <a href="#top" className="${p}-font-display font-bold">{brandName}</a>
          <a href="#contact" className="${p}-btn-primary text-sm hidden sm:inline-flex">{ctaLabel}</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
        <nav aria-label="Primary" className="-mb-px hidden gap-1 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="border-b-2 border-transparent px-4 py-3 text-sm hover:border-[var(--color-accent)]">{l.label}</a>)}
        </nav>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function portfolioCenter({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="fixed inset-x-0 top-0 z-50 mix-blend-difference text-white">
${NAV_SKIP_LINK}
      <div className="mx-auto flex max-w-[88rem] items-center justify-between px-5 py-6 sm:px-8">
        <nav aria-label="Primary left" className="hidden gap-8 lg:flex">
          {links.slice(0, 2).map((l) => <a key={l.href} href={l.href} className="text-sm">{l.label}</a>)}
        </nav>
        <a href="#top" className="${p}-font-display text-xl font-bold">{brandName}</a>
        <div className="flex items-center gap-4">
          <nav aria-label="Primary right" className="hidden gap-8 lg:flex">
            {links.slice(2).map((l) => <a key={l.href} href={l.href} className="text-sm">{l.label}</a>)}
          </nav>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function floatingPill({ p, pkg, Pascal }) {
  return minimalPill({ p, pkg, Pascal });
}

function darkCompact({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="sticky top-0 z-50 border-b border-[var(--border-default)] bg-[var(--color-background)] font-mono">
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-12 max-w-[82rem] items-center justify-between px-5 text-xs sm:px-8">
        <a href="#top">~/ {brandName.toLowerCase()}</a>
        <nav aria-label="Primary" className="hidden gap-6 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-[var(--color-muted)] hover:text-[var(--color-accent)]">{l.label}</a>)}
        </nav>
        <div className="flex gap-2">
          <a href="#contact" className="text-[var(--color-accent)] hidden sm:inline">{ctaLabel} →</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function terminalBar({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="sticky top-0 z-50 bg-[#0d140d] font-mono text-[#00ff88]">
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-10 max-w-[88rem] items-center justify-between border-b border-[#00ff88]/20 px-4 text-xs sm:px-8">
        <span>platform@v2</span>
        <nav aria-label="Primary" className="hidden gap-4 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <a href="#contact" className="hidden sm:inline">[{ctaLabel}]</a>
        ${hamburgerButton({ p, id: mobileId })}
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function industrialBold({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="sticky top-0 z-50 border-b-4 border-[var(--color-accent)] bg-[var(--color-background)]">
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-16 max-w-[88rem] items-stretch px-0 sm:px-8">
        <a href="#top" className="flex items-center bg-[var(--color-accent)] px-6 ${p}-font-display text-lg font-black uppercase text-[var(--color-background)]">{brandName}</a>
        <nav aria-label="Primary" className="hidden flex-1 items-center gap-8 px-8 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm font-bold uppercase tracking-wide">{l.label}</a>)}
        </nav>
        <a href="#contact" className="hidden items-center bg-[var(--color-surface)] px-6 text-sm font-bold sm:flex">{ctaLabel}</a>
        <div className="flex items-center px-4 lg:hidden">${hamburgerButton({ p, id: mobileId }).trim()}</div>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function lawClassic({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="border-b border-[var(--border-default)] bg-[var(--color-surface)]">
${NAV_SKIP_LINK}
      <div className="mx-auto max-w-[82rem] px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <a href="#top" className="${p}-font-display text-xl font-semibold">{brandName}</a>
          <a href="#contact" className="${p}-btn-primary hidden sm:inline-flex">{ctaLabel}</a>
          ${hamburgerButton({ p, id: mobileId })}
        </div>
        <nav aria-label="Primary" className="mt-4 hidden gap-8 border-t border-[var(--border-subtle)] pt-4 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm text-[var(--color-muted)]">{l.label}</a>)}
        </nav>
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}

function wellnessSoft({ p, pkg, Pascal }) {
  const mobileId = `${p}-mobile-nav`;
  return `"use client";
${navHeader({ p, pkg, Pascal })}
  return (
    <header data-v2-component="${pkg}-nav" className="sticky top-0 z-50 bg-[var(--color-background)]/90 backdrop-blur-sm">
${NAV_SKIP_LINK}
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="text-base font-medium text-[var(--color-muted)]">{brandName}</a>
        <nav aria-label="Primary" className="hidden gap-8 lg:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]">{l.label}</a>)}
        </nav>
        <a href="#contact" className="rounded-full bg-[var(--color-accent)]/15 px-4 py-2 text-sm text-[var(--color-accent)] hidden sm:inline-flex">{ctaLabel}</a>
        ${hamburgerButton({ p, id: mobileId })}
      </div>
      ${mobileMenu({ p, id: mobileId })}
    </header>
  );
}
`;
}
