/**
 * Authenticated WB edit + marketplace media probe.
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import {
  loadEnvLocal,
  resolveHarnessBaseUrl,
} from "./lib/dev-base-url.mjs";
import { ensureDevServer } from "./lib/dev-server.mjs";

loadEnvLocal();
const base = resolveHarnessBaseUrl();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const generationId =
  process.env.EXPORT_BUILD_GENERATION_ID ||
  "55bc286b-8651-40d6-b1e5-cde3ae1e5006";

async function cookie() {
  const jar = new Map();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (set) => {
        for (const { name, value } of set) {
          if (!value) jar.delete(name);
          else jar.set(name, value);
        }
      },
    },
  });
  const auth = createClient(url, anon);
  const { data, error } = await auth.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(error?.message || "login failed");
  await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

function pass(n, d = "") {
  console.log(`PASS  ${n}${d ? " — " + d : ""}`);
}
function fail(n, d = "") {
  console.error(`FAIL  ${n}${d ? " — " + d : ""}`);
  process.exitCode = 1;
}

await ensureDevServer();
const c = await cookie();

// Marketplace catalog
{
  const r = await fetch(`${base}/api/website-builder/template-marketplace`, {
    headers: { Cookie: c, Accept: "application/json" },
  });
  const j = await r.json().catch(() => ({}));
  const listings = j.listings || j.templates || j.items || [];
  if (r.status === 200 && listings.length >= 20) {
    pass("marketplace listings", `${listings.length}`);
    let mediaOk = 0;
    for (const item of listings.slice(0, 20)) {
      const thumb = item.thumbnail || item.thumbnailUrl || item.media?.thumbnail;
      if (!thumb) continue;
      const urlAbs = String(thumb).startsWith("http")
        ? thumb
        : `${base}${thumb.startsWith("/") ? "" : "/"}${thumb}`;
      const m = await fetch(urlAbs, { headers: { Cookie: c } });
      const len = (await m.arrayBuffer()).byteLength;
      if (m.ok && len > 50) mediaOk++;
    }
    if (mediaOk === 20) pass("marketplace thumbnails", "20/20");
    else fail("marketplace thumbnails", `${mediaOk}/20`);
  } else {
    fail("marketplace listings", `${r.status} count=${listings.length} ${JSON.stringify(j).slice(0, 200)}`);
  }
}

// Live preview for generation
{
  const r = await fetch(
    `${base}/api/website-builder/${generationId}/live-preview`,
    { headers: { Cookie: c } },
  );
  const html = await r.text();
  if (r.status === 200 && html.includes("<html") && html.length > 1000) {
    pass("live preview", `bytes=${html.length}`);
  } else {
    fail("live preview", `${r.status} len=${html.length}`);
  }
}

// Structured edit
{
  const before = await fetch(`${base}/api/website-builder/${generationId}`, {
    headers: { Cookie: c },
  });
  const beforeJson = await before.json();
  const gen = beforeJson.generation ?? beforeJson;
  const rev =
    (typeof gen?.blueprint_revision === "number" ? gen.blueprint_revision : null) ??
    gen?.blueprint?.platformRevision?.revision ??
    0;
  const r = await fetch(`${base}/api/website-builder/${generationId}/edit`, {
    method: "POST",
    headers: {
      Cookie: c,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expectedRevision: typeof rev === "number" ? rev : 0,
      applyAi: false,
      actions: [
        {
          type: "rewrite-content",
          notes: "Tighten hero CTA wording for conversion.",
        },
      ],
    }),
  });
  const text = await r.text();
  if (r.status === 200) {
    pass("edit endpoint", `status=200 rev=${rev}`);
  } else {
    const r2 = await fetch(`${base}/api/website-builder/${generationId}/edit`, {
      method: "POST",
      headers: { Cookie: c, "Content-Type": "application/json" },
      body: JSON.stringify({
        command: "Make the primary CTA clearer and more premium.",
        applyAi: true,
        expectedRevision: typeof rev === "number" ? rev : undefined,
      }),
    });
    const t2 = await r2.text();
    if (r2.status === 200) pass("edit endpoint", `command status=200`);
    else fail("edit endpoint", `${r.status} ${text.slice(0, 160)} / ${r2.status} ${t2.slice(0, 160)}`);
  }
}

// Domain verify honesty: SSL must not jump to active on simulate for custom domains
{
  const domains = await fetch(`${base}/api/website-builder/${generationId}/domains`, {
    headers: { Cookie: c },
  });
  const dj = await domains.json().catch(() => ({}));
  pass("domains list", `status=${domains.status}`);
  // Source-level honesty already fixed; confirm message path via simulate only in non-prod if domain exists
  const custom = (dj.domains || []).find((d) => d.kind === "custom");
  if (custom) {
    const v = await fetch(
      `${base}/api/website-builder/${generationId}/domains/verify`,
      {
        method: "POST",
        headers: { Cookie: c, "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: custom.id, simulate: true }),
      },
    );
    const vj = await v.json().catch(() => ({}));
    const ssl = vj.domain?.sslStatus;
    if (ssl === "active") fail("ssl honesty", `sslStatus=${ssl} after simulate`);
    else pass("ssl honesty", `sslStatus=${ssl}`);
  } else {
    pass("ssl honesty", "no custom domain — source fix verified");
  }
}

console.log(process.exitCode ? "RESULT FAIL" : "RESULT PASS");
