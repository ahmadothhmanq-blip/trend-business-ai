import type { AgencyBrandKit } from "@/lib/ai-core/agency-brand-kit/types";

export type BrandLogoAssets = {
  logoLight: string;
  logoDark: string;
  monogram: string;
  favicon: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function wordmarkSvg(params: {
  name: string;
  fg: string;
  accent: string;
  width?: number;
  height?: number;
}): string {
  const w = params.width ?? 240;
  const h = params.height ?? 48;
  const mono = initials(params.name);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${params.name}">
  <rect x="0" y="4" width="40" height="40" rx="10" fill="${params.accent}"/>
  <text x="20" y="30" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="16" font-weight="700">${mono}</text>
  <text x="52" y="32" fill="${params.fg}" font-family="system-ui,sans-serif" font-size="20" font-weight="600" letter-spacing="-0.02em">${params.name}</text>
</svg>`;
}

function monogramSvg(accent: string, fg: string, letters: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Logo">
  <rect width="64" height="64" rx="16" fill="${accent}"/>
  <text x="32" y="42" text-anchor="middle" fill="${fg}" font-family="system-ui,sans-serif" font-size="24" font-weight="700">${letters}</text>
</svg>`;
}

function faviconSvg(accent: string, letters: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="${accent}"/>
  <text x="16" y="22" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="12" font-weight="700">${letters.slice(0, 1)}</text>
</svg>`;
}

/** Generate professional SVG logo assets from brand kit. */
export function generateBrandLogoAssets(brandKit: AgencyBrandKit): BrandLogoAssets {
  const letters = initials(brandKit.companyName);
  const { primary, accent, foreground, background } = brandKit.colorPalette;

  return {
    logoLight: wordmarkSvg({
      name: brandKit.companyName,
      fg: foreground,
      accent: primary,
    }),
    logoDark: wordmarkSvg({
      name: brandKit.companyName,
      fg: "#ffffff",
      accent: accent,
    }),
    monogram: monogramSvg(primary, "#ffffff", letters),
    favicon: faviconSvg(accent, letters),
  };
}

export function brandLogoReactComponent(brandKit: AgencyBrandKit, assets: BrandLogoAssets): string {
  const light = assets.logoLight.replace(/"/g, '\\"').replace(/\n/g, "");
  const dark = assets.logoDark.replace(/"/g, '\\"').replace(/\n/g, "");
  return `"use client";

export function BrandLogo({ variant = "light" }: { variant?: "light" | "dark" }) {
  const svg = variant === "dark"
    ? "${dark}"
  : "${light}";
  return (
    <div
      className="inline-flex items-center"
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label="${brandKit.companyName}"
    />
  );
}
`;
}
