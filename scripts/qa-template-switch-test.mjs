/**
 * Verify in-project template switching via templatePackageId API.
 */
import { createServerClient } from "@supabase/ssr";
import { loadEnvLocal } from "./lib/dev-base-url.mjs";

loadEnvLocal();

const base = process.env.QA_BASE_URL || "http://localhost:3003";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const generationId = process.argv[2] || "2b50e196-80ed-4fe9-b038-59097f4a1440";

async function buildCookieHeader(accessToken, refreshToken) {
  const jar = new Map();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return [...jar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          if (!value) jar.delete(name);
          else jar.set(name, value);
        }
      },
    },
  });
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw error;
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

async function fingerprint(cookie, label) {
  const res = await fetch(
    `${base}/api/website-builder/${generationId}/live-preview`,
    { headers: { Cookie: cookie } },
  );
  const html = await res.text();
  const hash = [...html].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const sections = (html.match(/data-component="Theme[^"]+"/gi) || []).slice(0, 12);
  const nav = (html.match(/data-component="Theme[^"]*Nav[^"]*"/gi) || [])[0] || "";
  const hero = (html.match(/data-component="Theme[^"]*Hero[^"]*"/gi) || [])[0] || "";
  const colors = (html.match(/--color-[a-z-]+:[^;]{0,40}/gi) || []).slice(0, 6);
  const h1 = (html.match(/<h1[^>]*>([^<]{0,160})/i) || [])[1] || "";
  return { label, status: res.status, bytes: html.length, hash, sections, nav, hero, colors, h1 };
}

async function applyPackage(cookie, templatePackageId) {
  const res = await fetch(`${base}/api/website-builder/${generationId}/template`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ templatePackageId }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, structureTemplateId: data.structureTemplateId, ti: data.template?.id };
}

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(url, anon);
const { data: signIn, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (error) {
  console.error("login failed", error.message);
  process.exit(1);
}
const cookie = await buildCookieHeader(
  signIn.session.access_token,
  signIn.session.refresh_token,
);

const packages = [
  "modern-business",
  "saas-starter",
  "restaurant-bistro",
  "agency-portfolio",
];

const results = [];
let prevHash = null;

for (const pkg of packages) {
  const before = await fingerprint(cookie, `before-${pkg}`);
  const api = await applyPackage(cookie, pkg);
  const after = await fingerprint(cookie, `after-${pkg}`);
  const changedFromPrev = prevHash !== null ? prevHash !== after.hash : before.hash !== after.hash;
  results.push({
    package: pkg,
    api,
    changedFromPrevious: changedFromPrev,
    before: { hash: before.hash, nav: before.nav, hero: before.hero, sections: before.sections },
    after: { hash: after.hash, nav: after.nav, hero: after.hero, sections: after.sections, colors: after.colors },
  });
  prevHash = after.hash;
}

const uniqueHashes = new Set(results.map((r) => r.after.hash));
console.log(JSON.stringify({ generationId, uniqueAfterHashes: uniqueHashes.size, results }, null, 2));
process.exit(uniqueHashes.size === packages.length ? 0 : 1);
