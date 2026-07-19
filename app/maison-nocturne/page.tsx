import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { MaisonNocturneSite } from "@/components/maison-nocturne/site";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mn-display",
  display: "swap",
});

const body = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mn-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maison Nocturne — Michelin Star Fine Dining",
  description:
    "A Michelin-starred restaurant of dark luxury. Seasonal tasting menus, intimate reservations, and chef-driven cuisine.",
  openGraph: {
    title: "Maison Nocturne",
    description: "Michelin-starred fine dining. Reserve your evening.",
    type: "website",
  },
};

export default function MaisonNocturnePage() {
  return (
    <div
      className={`${display.variable} ${body.variable} mn-root`}
      style={
        {
          "--mn-bg": "#070706",
          "--mn-surface": "#10100e",
          "--mn-ink": "#f3eee4",
          "--mn-muted": "#9a9488",
          "--mn-gold": "#c6a46a",
          "--mn-gold-soft": "#a88955",
          "--mn-line": "rgba(198, 164, 106, 0.18)",
        } as CSSProperties
      }
    >
      <style>{`
        .mn-root {
          background: var(--mn-bg);
          color: var(--mn-ink);
          font-family: var(--font-mn-body), system-ui, sans-serif;
          min-height: 100vh;
        }
        .mn-root * { box-sizing: border-box; }
        .mn-display {
          font-family: var(--font-mn-display), Georgia, serif;
          letter-spacing: -0.02em;
        }
        .mn-eyebrow {
          font-family: var(--font-mn-body), system-ui, sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--mn-gold);
        }
        @keyframes mnFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mnReveal {
          from { opacity: 0; transform: scale(1.04); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes mnLine {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .mn-fade-up { animation: mnFadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .mn-reveal { animation: mnReveal 1.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .mn-line-draw {
          transform-origin: left center;
          animation: mnLine 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .mn-fade-up, .mn-reveal, .mn-line-draw { animation: none; }
        }
      `}</style>
      <MaisonNocturneSite />
    </div>
  );
}
