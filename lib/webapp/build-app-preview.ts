/**
 * Sandbox HTML runtime for App Builder live preview.
 * Renders StructuredAppModel screens with hash routing — no scripts (iframe-safe).
 */

import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export type AppPreviewInput = {
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

function slugFromPath(path: string): string {
  const p = path.replace(/^\//, "").trim();
  return p ? p.replace(/[^a-z0-9-]+/gi, "-").toLowerCase() : "home";
}

function renderComponent(
  type: string,
  props: Record<string, unknown>,
  model: StructuredAppModel,
): string {
  const title = escapeHtml(String(props.title || props.label || type));
  const style = props.style as Record<string, string> | undefined;
  const styleAttr = style
    ? ` style="${Object.entries(style)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${escapeHtml(String(v))}`)
        .join(";")}"`
    : "";

  if (type.includes("auth") || type === "auth-form") {
    return `<form class="card"${styleAttr}><h3>${title}</h3><input placeholder="Email" /><input type="password" placeholder="Password" /><button type="button">Sign in</button></form>`;
  }
  if (type.includes("chart") || type.includes("kpi") || type.includes("stats")) {
    return `<div class="card stat"${styleAttr}><div class="muted">KPI</div><div class="kpi">${title}</div><div class="muted">Live data binding</div></div>`;
  }
  if (type.includes("table") || type.includes("list") || type.includes("orders")) {
    const rows = model.catalog.slice(0, 4).map(
      (item) =>
        `<tr><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.price || "—")}</td><td>${escapeHtml(item.status || "active")}</td></tr>`,
    );
    return `<div class="card"${styleAttr}><h3>${title}</h3><table><thead><tr><th>Name</th><th>Value</th><th>Status</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  }
  if (type.includes("product") || type.includes("grid") || type.includes("catalog")) {
    const cards = model.catalog.slice(0, 6).map(
      (item) =>
        `<article class="product"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.price || "")}</span><p class="muted">${escapeHtml(item.description || item.category || "")}</p></article>`,
    );
    return `<div class="card"${styleAttr}><h3>${title}</h3><div class="grid">${cards.join("")}</div></div>`;
  }
  if (type.includes("calendar") || type.includes("booking")) {
    return `<div class="card"${styleAttr}><h3>${title}</h3><div class="calendar">Mon Tue Wed Thu Fri<br/>9am · 10am · 11am · 2pm · 4pm</div></div>`;
  }
  return `<div class="card"${styleAttr}><h3>${title}</h3><p class="muted">Component: ${escapeHtml(type)}</p></div>`;
}

/** Build multi-screen app preview HTML from structured model. */
export function buildAppPreviewHtml(input: AppPreviewInput): string {
  const { model } = input;
  const t = model.brand.tokens;
  const appName = escapeHtml(model.settings.appName || model.brand.businessName);
  const screens = [...model.screens].sort((a, b) => a.order - b.order);
  const defaultSlug = screens[0] ? slugFromPath(screens[0].path) : "home";

  const nav = model.navigation
    .map(
      (n) =>
        `<a href="#${escapeHtml(slugFromPath(n.href))}">${escapeHtml(n.label)}</a>`,
    )
    .join("");

  const screenViews = screens
    .map((screen) => {
      const slug = slugFromPath(screen.path);
      const comps = model.components.filter((c) => c.screenId === screen.id);
      const bindings = screen.dataBindings.length
        ? `<p class="muted">Data: ${screen.dataBindings.map(escapeHtml).join(", ")}</p>`
        : "";
      const componentHtml = comps
        .map((c) => renderComponent(c.type, c.props, model))
        .join("");
      const models = model.dataModels
        .filter((dm) => screen.dataBindings.includes(dm.name))
        .map(
          (dm) =>
            `<div class="model-pill">${escapeHtml(dm.label)} · ${dm.fields.length} fields</div>`,
        )
        .join("");

      return `<section id="${escapeHtml(slug)}" class="screen">
        <header class="screen-head">
          <h2>${escapeHtml(screen.name)}</h2>
          <p class="muted">${escapeHtml(screen.purpose)} · ${escapeHtml(screen.path)}</p>
          ${bindings}
          <div class="models">${models}</div>
        </header>
        <div class="screen-body">${componentHtml || '<div class="card muted">No components on this screen.</div>'}</div>
      </section>`;
    })
    .join("");

  const roles = model.roles.map((r) => `<span class="role">${escapeHtml(r.name)}</span>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${appName} — Live Preview</title>
<style>
:root {
  --primary: ${t.primary};
  --secondary: ${t.secondary};
  --accent: ${t.accent};
  --bg: ${t.background};
  --fg: ${t.foreground};
  --surface: ${t.surface};
  --radius: ${t.radius};
  --heading: ${t.headingFont}, system-ui, sans-serif;
  --body: ${t.bodyFont}, system-ui, sans-serif;
}
* { box-sizing: border-box; }
body { margin:0; font-family: var(--body); background: var(--bg); color: var(--fg); }
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.topbar { display:flex; align-items:center; gap:12px; padding:12px 20px; background:var(--surface); border-bottom:1px solid color-mix(in srgb, var(--primary) 25%, transparent); }
.topbar strong { color: var(--primary); font-family: var(--heading); }
.nav { display:flex; flex-wrap:wrap; gap:8px; padding:10px 20px; background: color-mix(in srgb, var(--surface) 90%, var(--bg)); border-bottom:1px solid color-mix(in srgb, var(--primary) 15%, transparent); }
.nav a { color: var(--fg); text-decoration:none; padding:6px 10px; border-radius:8px; font-size:13px; opacity:.85; }
.nav a:hover, .nav a:focus { background: color-mix(in srgb, var(--primary) 18%, transparent); opacity:1; }
.screen { display:none; padding:20px; animation: fade .2s ease; }
.screen:target { display:block; }
.screen:first-of-type { display:block; }
.screen:target ~ .screen:first-of-type:not(:target) { display:none; }
@keyframes fade { from { opacity:0 } to { opacity:1 } }
.screen-head h2 { margin:0 0 4px; font-family:var(--heading); color:var(--primary); }
.muted { opacity:.65; font-size:13px; }
.screen-body { display:grid; gap:12px; margin-top:16px; }
.card { background:var(--surface); border:1px solid color-mix(in srgb, var(--primary) 20%, transparent); border-radius:var(--radius); padding:16px; }
.card h3 { margin:0 0 8px; font-size:15px; }
.stat .kpi { font-size:28px; font-weight:700; color:var(--accent); }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:10px; }
.product { background: color-mix(in srgb, var(--surface) 95%, var(--primary)); border-radius:10px; padding:10px; display:flex; flex-direction:column; gap:4px; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th, td { text-align:left; padding:8px; border-bottom:1px solid color-mix(in srgb, var(--primary) 12%, transparent); }
.models { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
.model-pill { font-size:11px; padding:4px 8px; border-radius:999px; background: color-mix(in srgb, var(--accent) 20%, transparent); }
.roles { display:flex; gap:6px; margin-left:auto; }
.role { font-size:11px; padding:3px 8px; border-radius:6px; background: color-mix(in srgb, var(--secondary) 40%, transparent); }
input, button { width:100%; margin-top:8px; padding:10px; border-radius:8px; border:1px solid color-mix(in srgb, var(--primary) 25%, transparent); background:var(--bg); color:var(--fg); }
button { background:var(--primary); color:var(--bg); border:none; font-weight:600; cursor:pointer; }
.calendar { font-family: monospace; line-height:1.8; opacity:.8; }
footer { margin-top:auto; padding:12px 20px; font-size:11px; opacity:.5; border-top:1px solid color-mix(in srgb, var(--primary) 10%, transparent); }
</style>
</head>
<body>
<div class="app-shell">
  <div class="topbar">
    <strong>${appName}</strong>
    <span class="muted">${escapeHtml(model.templateId)} · ${screens.length} screens</span>
    <div class="roles">${roles}</div>
  </div>
  <nav class="nav">${nav || `<a href="#${defaultSlug}">Home</a>`}</nav>
  <main>${screenViews}</main>
  <footer>Trend Business AI · App Builder live preview (sandbox)</footer>
</div>
</body>
</html>`;
}

const PREVIEW_PATHS = ["preview/index.html", "public/preview.html"];

export function extractAppPreviewFromFiles(
  files: GeneratedProjectFile[] | undefined,
  fallback: AppPreviewInput,
): string {
  if (files?.length) {
    for (const path of PREVIEW_PATHS) {
      const file = files.find((f) => f.path.replaceAll("\\", "/") === path);
      if (file?.content?.includes("<html")) {
        return file.content
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
          .replace(/javascript:/gi, "");
      }
    }
  }
  return buildAppPreviewHtml(fallback);
}
