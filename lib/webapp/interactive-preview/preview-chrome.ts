/**
 * Preview-only chrome strings for the interactive sandbox.
 * App UI chrome comes from WEBAPP_UI_TRANSLATION_PACKS; these keys are preview-host only.
 */

import previewChromeJson from "@/lib/webapp/interactive-preview/preview-chrome.json";

export type PreviewChromeKey = keyof (typeof previewChromeJson)["English"];

const ENGLISH = previewChromeJson.English;

export function getPreviewChromeBundle(language: string): Record<string, string> {
  const pack =
    (previewChromeJson as Record<string, Record<string, string>>)[language] ||
    ENGLISH;
  const out: Record<string, string> = {};
  for (const key of Object.keys(ENGLISH) as PreviewChromeKey[]) {
    const value = pack[key] || ENGLISH[key];
    if (typeof value === "string" && value.trim()) out[key] = value;
  }
  return out;
}
