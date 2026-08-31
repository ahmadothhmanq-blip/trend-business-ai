"use client";

import { useEffect } from "react";

const REVEAL_PREFIXES = [
  "df",
  "hr",
  "mp",
  "rep",
  "as",
  "se",
  "cb",
  "fn",
  "ec",
  "ed",
  "sv",
  "cp",
  "rs",
  "rp",
  "ct",
  "pr",
  "ob",
  "pu",
  "fg",
  "lu",
] as const;

const DEFAULT_REVEAL_SELECTOR = [
  ...REVEAL_PREFIXES.map((p) => `.${p}-reveal`),
  "[data-v2-reveal]",
].join(", ");

/**
 * Scroll-reveal for flagship sections. Uses view() timeline when supported;
 * falls back to IntersectionObserver for older browsers.
 */
export function useFlagshipReveal(selector = DEFAULT_REVEAL_SELECTOR): void {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!nodes.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((node) => node.classList.add("df-is-visible"));
      return;
    }

    // Always use IntersectionObserver so static HTML previews and browsers with
    // flaky view() timelines still reveal content. view() CSS can run in parallel.
    nodes.forEach((node) => node.classList.add("df-reveal-js"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("df-is-visible");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [selector]);
}
