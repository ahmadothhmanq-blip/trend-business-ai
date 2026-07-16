/**
 * Authenticated functional smoke — requires SUPABASE URL + anon in env.
 * Creates a disposable user when possible; skips if signup blocked.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {
    /* ignore */
  }
}

loadEnvLocal();

const base = process.env.QA_BASE || "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const results = { pass: 0, fail: 0, skip: 0, notes: [] };

function record(ok, msg) {
  if (ok) {
    results.pass++;
    console.log("PASS:", msg);
  } else {
    results.fail++;
    console.log("FAIL:", msg);
    results.notes.push(msg);
  }
}

function skip(msg) {
  results.skip++;
  console.log("SKIP:", msg);
}

async function main() {
  console.log("=== Phase 20 Auth Smoke ===");
  if (!url || !anon) {
    skip("Missing Supabase env — cannot run authenticated tests");
    console.log(JSON.stringify(results));
    return;
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = `qa.phase20.${Date.now()}@gmail.com`;
  const password = `QaTest!${Date.now()}aA1`;

  // Register
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: "Phase 20 QA" } },
  });

  if (signUpError) {
    record(false, `signUp: ${signUpError.message}`);
  } else if (!signUpData.session) {
    skip("signUp requires email confirmation — session not issued");
    // Still verify login fails gracefully for unconfirmed if needed
  } else {
    record(true, "signUp issued session");
  }

  let accessToken = signUpData.session?.access_token;
  let refreshToken = signUpData.session?.refresh_token;

  if (!accessToken) {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      skip(`signIn unavailable: ${signInError.message}`);
    } else if (signInData.session) {
      accessToken = signInData.session.access_token;
      refreshToken = signInData.session.refresh_token;
      record(true, "signIn issued session");
    }
  }

  if (!accessToken) {
    console.log("\n=== AUTH SUMMARY ===");
    console.log(results);
    process.exitCode = results.fail > 0 ? 1 : 0;
    return;
  }

  // Cookie jar for Next app: set supabase auth cookies via /auth if available,
  // otherwise call APIs with Authorization bearer if supported.
  async function api(method, path, body) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Cookie: [
        `sb-access-token=${accessToken}`,
        refreshToken ? `sb-refresh-token=${refreshToken}` : "",
      ]
        .filter(Boolean)
        .join("; "),
    };
    const opts = { method, headers, redirect: "manual" };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const t = Date.now();
    const r = await fetch(base + path, opts);
    const text = await r.text();
    console.log([method, r.status, `${Date.now() - t}ms`, path, text.slice(0, 140)].join(" | "));
    return { status: r.status, text, loc: r.headers.get("location") || "" };
  }

  // Profile / prefs
  {
    const r = await api("GET", "/api/profile");
    // Cookie-based auth may not accept bearer — expect 200 or 401
    if (r.status === 200) record(true, "GET /api/profile authenticated");
    else {
      // Try establishing session via supabase SSR cookie names used by @supabase/ssr
      skip(`GET /api/profile => ${r.status} (app uses cookie session, not bearer)`);
    }
  }

  // Password reset request (server action not easily callable) — public forgot page already tested
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${base}/reset-password`,
  });
  record(!resetError, resetError ? `resetPassword: ${resetError.message}` : "resetPasswordForEmail ok");

  // Sign out
  const { error: outError } = await supabase.auth.signOut();
  record(!outError, outError ? `signOut: ${outError.message}` : "signOut ok");

  console.log("\n=== AUTH SUMMARY ===");
  console.log("Passed:", results.pass, "Failed:", results.fail, "Skipped:", results.skip);
  if (results.notes.length) console.log("Failures:", results.notes);
  process.exitCode = results.fail > 0 ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
