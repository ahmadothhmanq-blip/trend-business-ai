/**
 * Inject a clear Demo ribbon on publicly shared /w/app preview hosts.
 * Applied after sanitization so the markup stays first-party trusted.
 */

export function injectPublicAppDemoBanner(
  html: string,
  options?: { title?: string | null; localeHint?: string | null },
): string {
  const ar = Boolean(
    options?.localeHint &&
      (/arab/i.test(options.localeHint) ||
        options.localeHint === "ar" ||
        /[\u0600-\u06FF]/.test(options.localeHint)),
  );
  const label = ar ? "معاينة تجريبية" : "Demo preview";
  const detail = ar
    ? "هذه نسخة تفاعلية داخل المنصة — ليست استضافة Next.js كاملة. التطبيق الإنتاجي عبر ZIP."
    : "Interactive in-platform demo — not a full Next.js host. Production apps ship as a ZIP.";
  const title = (options?.title || "").trim();

  const banner = `<aside data-tbai-demo-banner="1" role="note" style="position:sticky;top:0;z-index:2147483646;display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap;padding:10px 14px;background:#0f172a;color:#f8fafc;font:600 12px/1.45 system-ui,sans-serif;border-bottom:2px solid #f59e0b;">
  <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#f59e0b;color:#111827;font-size:11px;letter-spacing:.04em;text-transform:uppercase;">${label}</span>
  <span style="flex:1;min-width:220px;font-weight:500;opacity:.95;">${detail}${title ? ` · ${escapeAttr(title)}` : ""}</span>
</aside>`;

  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body([^>]*)>/i, `<body$1>${banner}`);
  }
  return `${banner}${html}`;
}

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
