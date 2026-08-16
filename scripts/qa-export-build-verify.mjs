/**
 * Real export build verification:
 * fetch authenticated ZIP from a generation OR use fixture files,
 * run prepareWebsiteProjectForExport, write temp dir, npm install, next build.
 *
 * Env:
 *   EXPORT_BUILD_GENERATION_ID — optional existing generation UUID
 *   E2E_TEST_EMAIL / E2E_TEST_PASSWORD — required when using generation id
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import JSZip from "jszip";
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
const generationId = process.env.EXPORT_BUILD_GENERATION_ID;

async function buildCookie() {
  const jar = new Map();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return [...jar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          if (value === "" || value == null) jar.delete(name);
          else jar.set(name, value);
        }
      },
    },
  });
  const authClient = createClient(url, anon);
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) throw new Error(error?.message || "login failed");
  const { error: setErr } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  if (setErr) throw new Error(setErr.message);
  return [...jar.entries()].map(([n, v]) => `${n}=${v}`).join("; ");
}

async function downloadZip(cookie, id) {
  const res = await fetch(`${base}/api/website-builder/${id}/export`, {
    headers: { Cookie: cookie },
  });
  if (!res.ok) {
    throw new Error(`export ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function createGeneration(cookie) {
  const res = await fetch(`${base}/api/website-builder/stream`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      projectName: "Export Build Verify Co",
      businessDescription:
        "B2B analytics SaaS for mid-market operations teams. Professional dashboards, SOC2-ready messaging, and clear product pages.",
      targetAudience: "Operations leaders at mid-market companies",
      language: "English",
      pageCount: 3,
      websiteType: "saas",
    }),
  });
  const text = await res.text();
  let id = null;
  for (const line of text.split("\n")) {
    if (!line.startsWith("data:")) continue;
    try {
      const payload = JSON.parse(line.slice(5).trim());
      if (payload.generationId) id = payload.generationId;
      if (payload.id && payload.type === "complete") id = payload.id;
      if (payload.generation?.id) id = payload.generation.id;
    } catch {
      /* ignore */
    }
  }
  if (!id) {
    // Fallback: parse generation id from complete event variants
    const m = text.match(
      /"generationId"\s*:\s*"([0-9a-f-]{36})"|\"id\"\s*:\s*\"([0-9a-f-]{36})\"/i,
    );
    id = m?.[1] || m?.[2] || null;
  }
  if (!id) throw new Error(`generation failed: ${text.slice(0, 400)}`);
  return id;
}

async function main() {
  if (!email || !password) {
    console.error("E2E_TEST_EMAIL/PASSWORD required");
    process.exit(1);
  }
  await ensureDevServer();
  const cookie = await buildCookie();
  let id = generationId;
  if (!id) {
    console.log("Creating generation for export build verify…");
    id = await createGeneration(cookie);
    console.log("generation=", id);
  }
  console.log("Downloading ZIP…");
  const zipBuf = await downloadZip(cookie, id);
  const zip = await JSZip.loadAsync(zipBuf);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wb-export-build-"));
  console.log("extract →", tmpDir);
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const target = path.join(tmpDir, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, await entry.async("nodebuffer"));
  }
  const pkg = path.join(tmpDir, "package.json");
  if (!fs.existsSync(pkg)) throw new Error("package.json missing in export");
  console.log("npm install…");
  execSync("npm install --no-audit --no-fund", {
    cwd: tmpDir,
    stdio: "inherit",
    env: process.env,
  });
  console.log("next build…");
  execSync("npx next build", {
    cwd: tmpDir,
    stdio: "inherit",
    env: process.env,
  });
  console.log(JSON.stringify({ ok: true, generationId: id, tmpDir }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
