/**
 * Packaging health notes for App Builder mobile-store files.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

export function inspectMobileStorePackaging(
  files: GeneratedProjectFile[],
): string[] {
  const notes: string[] = [];
  const byPath = new Map(
    files.map((file) => [normalizePath(file.path), file] as const),
  );

  const assetlinks = byPath.get("public/.well-known/assetlinks.json");
  if (
    !assetlinks ||
    /REPLACE_WITH_YOUR_SIGNING_CERT_SHA256/i.test(assetlinks.content)
  ) {
    notes.push(
      "Android assetlinks.json still needs your signing certificate SHA256 fingerprint.",
    );
  }

  const iconSvg = [...byPath.keys()].filter((path) =>
    /^public\/icons\/.+\.svg$/i.test(path),
  );
  const iconPng = [...byPath.keys()].filter((path) =>
    /^public\/icons\/.+\.png$/i.test(path),
  );
  if (iconSvg.length > 0 && iconPng.length === 0) {
    notes.push(
      "Store icons are still placeholder SVG — replace with 512×512 PNG before store submit.",
    );
  }

  const twa = byPath.get("mobile-store/twa-manifest.json");
  if (twa && /example\.com|localhost|REPLACE_/i.test(twa.content)) {
    notes.push(
      "twa-manifest.json still has a placeholder host — set your real HTTPS production URL.",
    );
  }

  const cap = byPath.get("mobile-store/capacitor.config.ts");
  if (cap && /example\.com|localhost|YOUR_/i.test(cap.content)) {
    notes.push(
      "capacitor.config.ts still has a placeholder server URL — set your real HTTPS production URL.",
    );
  }

  const playGuide = byPath.get("mobile-store/GOOGLE_PLAY.md");
  const appleGuide = byPath.get("mobile-store/APPLE_APP_STORE.md");
  if (!playGuide || !appleGuide) {
    notes.push("Store guide markdown files are missing — run sync packaging.");
  }

  if (notes.length === 0) {
    notes.push("Mobile-store packaging files look ready for local build.");
  }

  return notes;
}
