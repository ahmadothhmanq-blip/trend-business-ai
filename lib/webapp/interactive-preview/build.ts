/**
 * Build interactive App Builder live-preview HTML (SPA, in-memory only).
 */

import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import {
  APP_PREVIEW_RUNTIME_VERSION,
  buildAppPreviewManifest,
} from "@/lib/webapp/interactive-preview/manifest";
import { getInteractivePreviewRuntimeScript } from "@/lib/webapp/interactive-preview/runtime-script";

export type InteractivePreviewInput = {
  model: StructuredAppModel;
  activeScreenPath?: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Trusted interactive preview document — scripts are first-party runtime only. */
export function buildInteractiveAppPreviewHtml(
  input: InteractivePreviewInput,
): string {
  const manifest = buildAppPreviewManifest(input.model, {
    activeScreenPath: input.activeScreenPath,
  });
  const tokens = manifest.brand;
  const manifestJson = JSON.stringify(manifest).replace(/</g, "\\u003c");
  const runtime = getInteractivePreviewRuntimeScript();

  return `<!DOCTYPE html>
<html lang="${escapeHtml(manifest.htmlLang)}" dir="${escapeHtml(manifest.dir)}" data-preview-runtime="interactive" data-preview-trusted="1" data-preview-version="${APP_PREVIEW_RUNTIME_VERSION}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="tbai-preview-runtime" content="${APP_PREVIEW_RUNTIME_VERSION}"/>
<title>${escapeHtml(manifest.appName)}</title>
<style>
:root {
  --primary: ${tokens.primary};
  --secondary: ${tokens.secondary};
  --accent: ${tokens.accent};
  --bg: ${tokens.background};
  --fg: ${tokens.foreground};
  --surface: ${tokens.surface};
  --radius: ${tokens.radius};
  --heading: ${tokens.headingFont}, system-ui, sans-serif;
  --body: ${tokens.bodyFont}, system-ui, sans-serif;
}
* { box-sizing: border-box; }
body { margin:0; font-family: var(--body); background: var(--bg); color: var(--fg); font-size: 14px; }
.app-shell { min-height: 100%; display: flex; flex-direction: column; }
.topbar { display:flex; align-items:center; gap:10px; padding:10px 16px; background:var(--surface); border-bottom:1px solid color-mix(in srgb, var(--primary) 25%, transparent); flex-wrap:wrap; }
.topbar strong { color: var(--primary); font-family: var(--heading); font-size:15px; }
.topbar-meta { margin-inline-start:auto; display:flex; gap:8px; align-items:center; flex-wrap:wrap; font-size:12px; }
.topbar-meta button, .toolbar button, .form-actions button, .actions button, .pager button, .card.stat { cursor:pointer; }
.nav { display:flex; flex-wrap:wrap; gap:6px; padding:8px 16px; background: color-mix(in srgb, var(--surface) 90%, var(--bg)); border-bottom:1px solid color-mix(in srgb, var(--primary) 15%, transparent); }
.nav a { color: var(--fg); text-decoration:none; padding:5px 9px; border-radius:8px; font-size:12px; opacity:.85; }
.nav a.active, .nav a:hover, .nav a:focus { background: color-mix(in srgb, var(--primary) 18%, transparent); opacity:1; }
main { padding:20px 16px; flex:1; }
.screen-head { margin-bottom:14px; }
.screen-head h2 { margin:0 0 6px; font-family:var(--heading); color:var(--primary); font-size:1.35rem; letter-spacing:-0.01em; }
.screen-head .muted { margin:0; line-height:1.45; max-width:46rem; }
.muted { opacity:.82; font-size:12px; line-height:1.4; }
.card { background:var(--surface); border:1px solid color-mix(in srgb, var(--primary) 20%, transparent); border-radius:var(--radius); padding:16px; margin-top:12px; }
.card h3 { margin:0 0 10px; font-size:14px; font-weight:650; }
.card.stat { text-align:start; width:100%; color:inherit; font:inherit; padding:16px; transition:border-color .15s ease, box-shadow .15s ease; }
.card.stat:hover, .card.stat:focus-visible { border-color: color-mix(in srgb, var(--primary) 45%, transparent); box-shadow:0 6px 18px color-mix(in srgb, var(--primary) 12%, transparent); }
.stat .label { font-size:12px; opacity:.8; margin-bottom:6px; }
.stat .kpi { font-size:28px; font-weight:700; color:var(--accent); line-height:1.1; letter-spacing:-0.02em; }
.stat .cta { margin-top:10px; font-size:12px; font-weight:600; color:var(--primary); }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:10px; }
.grid.stats { grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
.empty-state { text-align:center; padding:28px 16px; }
.empty-state p { margin:0 0 12px; }
.empty-state .title { font-size:14px; font-weight:650; margin:0 0 6px; color:var(--fg); }
.product { background: color-mix(in srgb, var(--surface) 95%, var(--primary)); border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:4px; }
table { width:100%; border-collapse:collapse; font-size:12px; min-width:720px; }
th, td { text-align:start; padding:10px 8px; border-bottom:1px solid color-mix(in srgb, var(--primary) 12%, transparent); }
th { font-size:11px; text-transform:uppercase; letter-spacing:.04em; opacity:.75; font-weight:650; }
.toolbar { display:flex; flex-wrap:wrap; gap:8px; margin:4px 0 12px; align-items:center; }
.toolbar input, .toolbar select, .form input, .form select, .form textarea, .topbar-meta select {
  padding:7px 9px; border-radius:8px; border:1px solid color-mix(in srgb, var(--primary) 25%, transparent);
  background:var(--bg); color:var(--fg); font-size:13px;
}
.toolbar button, .form button, .actions button, .pager button, .topbar-meta button {
  min-height:36px;
  padding:7px 11px; border-radius:8px; border:none; background:var(--primary); color:var(--bg); font-weight:600; font-size:12px;
}
.actions { display:flex; gap:6px; flex-wrap:wrap; }
.form label { display:block; margin-top:8px; font-size:12px; }
.form .field { display:flex; flex-direction:column; gap:4px; margin-top:8px; }
.form-actions { display:flex; gap:8px; margin-top:12px; }
.field-error { color:#dc2626; font-size:11px; }
.flash { margin:10px 0; padding:8px 10px; border-radius:8px; font-size:12px; cursor:pointer; }
.flash.ok { background: color-mix(in srgb, #16a34a 20%, var(--surface)); }
.flash.err { background: color-mix(in srgb, #dc2626 20%, var(--surface)); }
.pager { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:10px; font-size:12px; }
.pager button:disabled { opacity:.4; cursor:not-allowed; }
.trust-banner {
  margin: 0 16px 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  font-size: 12px;
  line-height: 1.45;
}
.kanban {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 8px;
}
.kanban-col {
  background: color-mix(in srgb, var(--surface) 92%, var(--bg));
  border: 1px solid color-mix(in srgb, var(--primary) 16%, transparent);
  border-radius: 12px;
  padding: 10px;
  min-height: 220px;
}
.kanban-col h4 {
  margin: 0 0 8px;
  font-size: 12px;
  text-transform: capitalize;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.kanban-card {
  background: var(--surface);
  border: 1px solid color-mix(in srgb, var(--primary) 18%, transparent);
  border-radius: 10px;
  padding: 10px;
  margin-top: 8px;
}
.kanban-card strong { display:block; font-size:13px; margin-bottom:4px; }
.kanban-card .meta { font-size:11px; opacity:.8; margin-bottom:8px; }
.kanban-card .actions { gap:4px; }
.kanban-card .actions button { min-height:28px; padding:4px 8px; font-size:11px; background: transparent; color: var(--fg); border:1px solid color-mix(in srgb, var(--primary) 30%, transparent); }
footer { margin-top:auto; padding:10px 16px; font-size:11px; opacity:.5; border-top:1px solid color-mix(in srgb, var(--primary) 10%, transparent); }
.table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
:where(input, select, textarea, button, a):focus-visible {
  outline:2px solid color-mix(in srgb, var(--accent) 85%, white);
  outline-offset:2px;
}
.actions button { min-width:70px; }
@media (max-width: 900px) {
  main { padding:12px; }
  .card { padding:12px; }
  .toolbar { gap:6px; }
  .toolbar input, .toolbar select, .toolbar button { width:100%; }
  .pager { flex-wrap:wrap; }
}
.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
  margin-inline: auto;
}
.auth .screen-head {
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
}
.auth .screen-head .muted { margin-inline: auto; }
.auth .form {
  width: 100%;
  max-width: 380px;
  margin-top: 0;
}
.auth .form input {
  width: 100%;
  min-height: 40px;
  pointer-events: auto;
}
.auth .form button.secondary,
button.secondary {
  background: transparent;
  color: var(--primary);
  font-weight: 600;
  margin-top: 8px;
  border: 1px solid color-mix(in srgb, var(--primary) 35%, transparent);
}
.auth .form button.linkish,
button.linkish {
  background: transparent;
  color: var(--primary);
  font-weight: 500;
  margin-top: 8px;
  padding: 6px 0;
  text-decoration: underline;
}
</style>
</head>
<body>
<div id="app" data-preview-boot="1">Loading preview…</div>
<script type="application/json" id="__PREVIEW_MANIFEST__">${manifestJson}</script>
<script id="__PREVIEW_RUNTIME__">${runtime}</script>
</body>
</html>`;
}
