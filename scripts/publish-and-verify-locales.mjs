/**
 * Publish a generation and verify /w/slug + /w/slug/ar
 * Usage: node scripts/publish-and-verify-locales.mjs [generationId]
 */
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { loadEnvLocal, resolveHarnessBaseUrl } from "./lib/dev-base-url.mjs";

loadEnvLocal();

const base = resolveHarnessBaseUrl();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const genId = process.argv[2] || "3c0690dc-24d0-41e2-ab42-6646ee97ff5e";

async function buildCookie(access, refresh) {
  const jar = new Map();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return [...jar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookies) {
        for (const { name, value } of cookies) {
          if (!value) jar.delete(name);
          else jar.set(name, value);
        }
      },
    },
  });
  await supabase.auth.setSession({
    access_token: access,
    refresh_token: refresh,
  });
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

function titleOf(html) {
  const m = html.match(/<title[^>]*>([^<]*)</i);
  return m?.[1]?.trim() || "(none)";
}

async function main() {
  const client = createClient(url, anon, {
    auth: { persistSession: false },
  });
  const { data: si, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !si.session) {
    console.error("login failed:", error?.message);
    process.exit(1);
  }
  const cookie = await buildCookie(
    si.session.access_token,
    si.session.refresh_token,
  );

  console.log(`Publishing generation ${genId}…`);
  const pub = await fetch(`${base}/api/website-builder/${genId}/publish`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ action: "publish", force: true }),
  });
  const pubJson = await pub.json();
  console.log("publish status:", pub.status);

  if (!pubJson.publicUrl) {
    console.error("publish failed:", JSON.stringify(pubJson).slice(0, 400));
    process.exit(1);
  }

  const publicUrl = pubJson.publicUrl;
  console.log("publicUrl (prod):", publicUrl);

  // Verify on local dev server (prod URL may be unreachable from local)
  const slug = pubJson.publication?.public_path?.replace(/^\/w\//, "") ||
    publicUrl?.match(/\/w\/([^/?#]+)/)?.[1];
  const localBase = base.replace(/\/$/, "");
  const verifyUrl = slug ? `${localBase}/w/${slug}` : publicUrl;
  console.log("verifyUrl (local):", verifyUrl);

  const primary = await fetch(verifyUrl);
  const primaryHtml = await primary.text();
  console.log("\n--- Primary (EN) ---");
  console.log("HTTP:", primary.status, "| bytes:", primaryHtml.length);
  console.log("title:", titleOf(primaryHtml));
  console.log("tb-language-switcher:", primaryHtml.includes("tb-language-switcher"));
  console.log("tb-visual-skin:", primaryHtml.includes("tb-visual-skin"));

  const arUrl = `${verifyUrl.replace(/\/$/, "")}/ar`;
  const ar = await fetch(arUrl);
  const arHtml = await ar.text();
  console.log("\n--- /ar ---");
  console.log("HTTP:", ar.status, "| bytes:", arHtml.length);
  console.log("title:", titleOf(arHtml));
  console.log("tb-locale:ar:", arHtml.includes("tb-locale:ar"));
  console.log("dir=rtl:", /dir=["']?rtl/i.test(arHtml));
  console.log("differs from primary:", arHtml !== primaryHtml);

  const failed = [];
  if (!primary.ok) failed.push("primary HTTP");
  if (!primaryHtml.includes("tb-language-switcher")) failed.push("switcher");
  if (!ar.ok) failed.push("/ar HTTP");
  if (!arHtml.includes("tb-locale:ar")) failed.push("tb-locale:ar");
  if (arHtml === primaryHtml) failed.push("locale content identical");

  console.log("\n=== Result ===");
  if (failed.length) {
    console.log("FAIL:", failed.join(", "));
    process.exit(1);
  }
  console.log("PASS — publish + locales verified");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
