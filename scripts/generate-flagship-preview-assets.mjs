/**
 * Generate marketplace preview assets for flagship templates.
 * Run: node scripts/generate-flagship-preview-assets.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brandNameFor } from "./template-brand-names.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const FLAGSHIPS = [
  {
    id: "ecommerce-premium",
    label: brandNameFor("ecommerce-premium"),
    primary: "#18181B",
    accent: "#BE123C",
    bg: "#FAFAF9",
    surface: "#FFFFFF",
    muted: "rgba(24,24,27,0.1)",
    layout: "single",
  },
  {
    id: "medical-premium",
    label: brandNameFor("medical-premium"),
    primary: "#0F4C4C",
    accent: "#5B9A8B",
    bg: "#F7FAF9",
    surface: "#E4F2EE",
    muted: "rgba(15,41,41,0.1)",
    layout: "single",
  },
  {
    id: "saas-enterprise",
    label: brandNameFor("saas-enterprise"),
    primary: "#1D4ED8",
    accent: "#3B82F6",
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    muted: "rgba(15,23,42,0.12)",
    layout: "single",
  },
  {
    id: "ai-startup-signal",
    label: brandNameFor("ai-startup-signal"),
    primary: "#020617",
    accent: "#22D3EE",
    bg: "#030712",
    surface: "#0F172A",
    muted: "rgba(240,249,255,0.12)",
    layout: "single",
  },
  {
    id: "corporate-business",
    label: brandNameFor("corporate-business"),
    primary: "#0F2B46",
    accent: "#C5A572",
    bg: "#FFFFFF",
    surface: "#F7F5F2",
    muted: "rgba(15,43,70,0.1)",
    layout: "single",
  },
  {
    id: "restaurant-premium",
    label: brandNameFor("restaurant-premium"),
    primary: "#1B3D2F",
    accent: "#D4A574",
    bg: "#0A1210",
    surface: "#121F1A",
    muted: "rgba(244,237,228,0.08)",
    layout: "sidebar",
  },
];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function thumbnailSvg(t) {
  const textColor = t.layout === "sidebar" ? "#F4EDE4" : "#0F172A";
  const navText = t.layout === "sidebar" ? "#fff" : "#fff";
  const sidebar = t.layout === "sidebar"
    ? `<rect x="0" y="56" width="72" height="344" fill="${t.surface}" opacity="0.95"/>
       <rect x="12" y="80" width="48" height="4" rx="2" fill="${t.accent}" opacity="0.5"/>
       <rect x="12" y="96" width="40" height="3" rx="1.5" fill="${t.muted}"/>
       <rect x="12" y="108" width="44" height="3" rx="1.5" fill="${t.muted}"/>
       <rect x="12" y="120" width="36" height="3" rx="1.5" fill="${t.muted}"/>`
    : "";
  const mainX = t.layout === "sidebar" ? 88 : 48;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400" role="img" aria-label="${esc(t.label)} thumbnail">
  <defs>
    <linearGradient id="hero-${t.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.primary}"/>
      <stop offset="100%" stop-color="${t.accent}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="${t.bg}"/>
  <rect x="0" y="0" width="640" height="56" fill="${t.primary}" opacity="0.95"/>
  <circle cx="28" cy="28" r="10" fill="${t.accent}" opacity="0.9"/>
  <rect x="48" y="22" width="80" height="12" rx="4" fill="#fff" opacity="0.85"/>
  <rect x="480" y="20" width="96" height="16" rx="8" fill="url(#hero-${t.id})"/>
  ${sidebar}
  <rect x="${mainX}" y="88" width="200" height="10" rx="4" fill="${t.accent}" opacity="0.55"/>
  <rect x="${mainX}" y="112" width="320" height="28" rx="6" fill="${textColor}" opacity="0.18"/>
  <rect x="${mainX}" y="152" width="260" height="20" rx="5" fill="${textColor}" opacity="0.1"/>
  <rect x="${mainX}" y="188" width="140" height="36" rx="18" fill="url(#hero-${t.id})"/>
  <rect x="${mainX}" y="188" width="140" height="36" rx="18" fill="none" stroke="${t.accent}" stroke-width="1.5" transform="translate(156 0)"/>
  <rect x="${mainX}" y="260" width="${t.layout === "sidebar" ? 520 : 544}" height="88" rx="10" fill="${t.surface}" stroke="${t.muted}" stroke-width="1"/>
  <rect x="${mainX + 16}" y="280" width="120" height="48" rx="6" fill="${t.muted}"/>
  <rect x="${mainX + 152}" y="280" width="120" height="48" rx="6" fill="${t.muted}"/>
  <rect x="${mainX + 288}" y="280" width="120" height="48" rx="6" fill="${t.muted}"/>
  <text x="48" y="36" fill="${navText}" font-family="system-ui,sans-serif" font-size="13" font-weight="600">${esc(t.label)}</text>
</svg>`;
}

function previewSvg(t, width, height, label) {
  const isMobile = width < 500;
  const isTablet = width >= 500 && width < 1000;
  const textColor = t.layout === "sidebar" ? "#F4EDE4" : "#0F172A";
  const sidebarW = isMobile ? 0 : isTablet ? 56 : 72;
  const pad = Math.round(width * 0.05);
  const mainX = pad + sidebarW + (sidebarW ? 12 : 0);
  const mainW = width - mainX - pad;
  const navH = Math.round(height * 0.08);
  const heroH = Math.round(height * 0.28);
  const cardH = Math.round(height * 0.12);
  const cols = isMobile ? 1 : isTablet ? 2 : 3;
  const cardW = Math.floor((mainW - (cols - 1) * 12) / cols);

  const sidebar = sidebarW
    ? `<rect x="${pad}" y="${navH + 8}" width="${sidebarW}" height="${height - navH - Math.round(height * 0.12) - 16}" rx="6" fill="${t.surface}" opacity="0.95"/>
       <rect x="${pad + 10}" y="${navH + 28}" width="${sidebarW - 20}" height="4" rx="2" fill="${t.accent}" opacity="0.5"/>
       <rect x="${pad + 10}" y="${navH + 44}" width="${sidebarW - 24}" height="3" rx="1.5" fill="${t.muted}"/>
       <rect x="${pad + 10}" y="${navH + 56}" width="${sidebarW - 16}" height="3" rx="1.5" fill="${t.muted}"/>`
    : "";

  const cards = Array.from({ length: cols }, (_, i) => {
    const x = mainX + i * (cardW + 12);
    const y = navH + heroH + Math.round(height * 0.06);
    return `<rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="10" fill="${t.surface}" stroke="${t.muted}" stroke-width="1"/>
      <rect x="${x + 14}" y="${y + 16}" width="${Math.round(cardW * 0.5)}" height="8" rx="4" fill="${textColor}" opacity="0.15"/>
      <rect x="${x + 14}" y="${y + 34}" width="${Math.round(cardW * 0.7)}" height="6" rx="3" fill="${textColor}" opacity="0.08"/>`;
  }).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(t.label)} ${esc(label)} preview">
  <defs>
    <linearGradient id="g-${t.id}-${width}" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0%" stop-color="${t.primary}"/>
      <stop offset="100%" stop-color="${t.accent}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${t.bg}"/>
  <rect width="${width}" height="${navH}" fill="${t.primary}"/>
  <circle cx="${pad + 14}" cy="${Math.round(navH / 2)}" r="10" fill="${t.accent}"/>
  <rect x="${pad + 32}" y="${Math.round(navH / 2) - 6}" width="${Math.round(width * 0.15)}" height="12" rx="4" fill="#fff" opacity="0.85"/>
  <rect x="${width - pad - Math.round(width * 0.18)}" y="${Math.round(navH / 2) - 10}" width="${Math.round(width * 0.18)}" height="20" rx="10" fill="url(#g-${t.id}-${width})"/>
  ${sidebar}
  <rect x="${mainX}" y="${navH + 16}" width="${Math.round(mainW * 0.35)}" height="10" rx="4" fill="${t.accent}" opacity="0.6"/>
  <rect x="${mainX}" y="${navH + 36}" width="${Math.round(mainW * 0.75)}" height="${Math.round(heroH * 0.22)}" rx="8" fill="${textColor}" opacity="0.16"/>
  <rect x="${mainX}" y="${navH + 36 + Math.round(heroH * 0.28)}" width="${Math.round(mainW * 0.55)}" height="${Math.round(heroH * 0.14)}" rx="6" fill="${textColor}" opacity="0.09"/>
  <rect x="${mainX}" y="${navH + Math.round(heroH * 0.72)}" width="${Math.round(mainW * 0.28)}" height="32" rx="16" fill="url(#g-${t.id}-${width})"/>
  ${cards}
  <rect x="${pad}" y="${height - Math.round(height * 0.1)}" width="${width - pad * 2}" height="1" fill="${t.muted}"/>
  <text x="${pad}" y="${Math.round(navH * 0.65)}" fill="#fff" font-family="system-ui,sans-serif" font-size="${Math.max(11, Math.round(width * 0.022))}" font-weight="600">${esc(t.label)} · ${esc(label)}</text>
</svg>`;
}

for (const t of FLAGSHIPS) {
  const assetsDir = path.join(root, "templates", "website", t.id, "assets");
  await mkdir(assetsDir, { recursive: true });
  await writeFile(path.join(assetsDir, "thumbnail.svg"), thumbnailSvg(t), "utf8");
  await writeFile(path.join(assetsDir, "thumbnail.png"), Buffer.from(""), "utf8");
  await writeFile(path.join(assetsDir, "preview.svg"), previewSvg(t, 1440, 900, "Desktop"), "utf8");
  await writeFile(path.join(assetsDir, "preview.png"), Buffer.from(""), "utf8");
  await writeFile(
    path.join(assetsDir, "preview-tablet.svg"),
    previewSvg(t, 768, 1024, "Tablet"),
    "utf8",
  );
  await writeFile(
    path.join(assetsDir, "preview-mobile.svg"),
    previewSvg(t, 390, 844, "Mobile"),
    "utf8",
  );
  console.log(`Assets: ${t.id}`);
}

console.log("Done.");
