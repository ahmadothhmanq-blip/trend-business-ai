/** Font fallback stacks — single source for family resolution. */
export const TBDP_FONT_FALLBACKS = {
  latin: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  arabic: '"Noto Sans Arabic", "Alexandria", ui-sans-serif, system-ui, sans-serif',
  displayLatin: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif',
  displayArabic: '"Alexandria", "Noto Sans Arabic", ui-sans-serif, system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, "Cascadia Code", monospace',
} as const;
