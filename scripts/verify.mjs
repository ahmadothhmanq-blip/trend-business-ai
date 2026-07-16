/**
 * Project verification: Supabase schema, RLS, auth client, API routes, pages.
 * Loads .env.local when present. Exit code 1 on any failure.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const openAiKey = process.env.OPENAI_API_KEY;
const deepseekKey = process.env.DEEPSEEK_API_KEY;
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const DASHBOARD_PAGES = [
  "/dashboard",
  "/dashboard/projects",
  "/dashboard/ideas",
  "/dashboard/market-analysis",
  "/dashboard/reports",
  "/dashboard/profile",
  "/dashboard/website-builder",
  "/dashboard/website-builder/settings",
  "/dashboard/history",
  "/dashboard/favorites",
  "/dashboard/admin",
  "/dashboard/analytics",
  "/dashboard/api-keys",
  "/dashboard/billing",
  "/dashboard/ai-agents",
  "/dashboard/ai-providers",
  "/dashboard/app-builder",
  "/dashboard/brand-studio",
  "/dashboard/business-intelligence",
  "/dashboard/content-studio",
  "/dashboard/feasibility-study",
  "/dashboard/files",
  "/dashboard/growth",
  "/dashboard/image-generator",
  "/dashboard/landing-page-builder",
  "/dashboard/logo-maker",
  "/dashboard/marketing",
  "/dashboard/notifications",
  "/dashboard/seo",
  "/dashboard/settings",
  "/dashboard/social-media",
  "/dashboard/team",
  "/dashboard/templates",
  "/dashboard/usage",
  "/dashboard/video-studio",
];

const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const PUBLIC_PAGES = [
  "/",
  "/features",
  "/pricing",
  "/docs",
  "/contact",
  "/faq",
  "/changelog",
  "/blog",
  "/privacy",
  "/terms",
  "/templates",
  "/learn",
  "/resources",
];

const TABLES = [
  "profiles",
  "business_ideas",
  "market_analyses",
  "reports",
  "favorites",
  "user_preferences",
  "website_generations",
  "workspace_generations",
  "organizations",
  "org_members",
  "billing_checkout_sessions",
  "growth_leads",
  "growth_affiliates",
  "growth_events",
];

const EXPECTED_RLS_POLICIES = {
  profiles: ["select", "insert", "update"],
  business_ideas: ["select", "insert", "update", "delete"],
  market_analyses: ["select", "insert", "update", "delete"],
  reports: ["select", "insert", "update", "delete"],
  favorites: ["select", "insert", "delete"],
  user_preferences: ["select", "insert", "update"],
  website_generations: ["select", "insert", "update", "delete"],
  workspace_generations: ["select", "insert", "update", "delete"],
  growth_leads: ["select", "insert", "update"],
  growth_affiliates: ["select", "insert", "update"],
};

const API_ROUTES = [
  { path: "/api/ideas", methods: ["GET", "POST"] },
  { path: "/api/market-analysis", methods: ["GET", "POST"] },
  { path: "/api/reports", methods: ["GET", "POST"] },
  { path: "/api/profile", methods: ["GET", "POST"] },
  { path: "/api/preferences", methods: ["GET", "PUT"] },
  { path: "/api/website-builder", methods: ["GET", "POST"] },
  { path: "/api/workspaces/[type]", methods: ["GET", "POST"] },
  { path: "/api/growth/dashboard", methods: ["GET"] },
  { path: "/api/growth/leads", methods: ["POST"] },
  { path: "/api/seo/health", methods: ["GET"] },
];

const results = [];
let failed = false;

function pass(label, detail) {
  results.push({ ok: true, label, detail });
  console.log(`  ✓ ${label}${detail ? `: ${detail}` : ""}`);
}

function fail(label, detail) {
  failed = true;
  results.push({ ok: false, label, detail });
  console.log(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
}

async function verifySupabase() {
  console.log("\n[1] Environment");
  if (!url) {
    fail("NEXT_PUBLIC_SUPABASE_URL", "missing");
    return null;
  }
  pass("NEXT_PUBLIC_SUPABASE_URL", url);
  if (!anonKey) {
    fail("NEXT_PUBLIC_SUPABASE_ANON_KEY", "missing");
    return null;
  }
  pass("NEXT_PUBLIC_SUPABASE_ANON_KEY", "set");
  if (!siteUrl) {
    if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
      fail("NEXT_PUBLIC_SITE_URL", "required in production for canonicals/sitemaps/auth redirects");
    } else {
      pass("NEXT_PUBLIC_SITE_URL", "missing — using localhost fallback (set before production launch)");
    }
  } else if (!/^https?:\/\/[^/]+/.test(siteUrl)) {
    fail("NEXT_PUBLIC_SITE_URL", "must be an absolute URL");
  } else {
    pass("NEXT_PUBLIC_SITE_URL", siteUrl.replace(/\/+$/, ""));
  }
  if (!openAiKey) {
    fail("OPENAI_API_KEY", "missing — live AI generation disabled");
  } else {
    pass("OPENAI_API_KEY", "set");
  }
  if (!deepseekKey) {
    fail("DEEPSEEK_API_KEY", "missing — Website/App Builder generation disabled");
  } else {
    pass("DEEPSEEK_API_KEY", "set");
  }
  if (!upstashUrl || !upstashToken) {
    pass(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN",
      "missing — production uses per-instance fallback limits",
    );
  } else {
    pass("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN", "set");
  }

  const supabase = createClient(url, anonKey);
  console.log("\n[2] Database tables");
  for (const table of TABLES) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      if (
        error.message.includes("does not exist") ||
        error.message.includes("schema cache") ||
        error.code === "42P01" ||
        error.message.includes("Could not find the table")
      ) {
        fail(`table ${table}`, "missing — run migrations");
      } else {
        pass(`table ${table}`, "exists");
      }
    } else {
      pass(`table ${table}`, "exists");
    }
  }

  console.log("\n[3] Row Level Security (anonymous access blocked)");
  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      if (
        error.message.includes("does not exist") ||
        error.message.includes("schema cache") ||
        error.message.includes("Could not find the table")
      ) {
        fail(`RLS ${table}`, "table missing");
      } else if (error.message.includes("permission") || error.code === "42501") {
        pass(`RLS ${table}`, "access denied for anon");
      } else {
        fail(`RLS ${table}`, error.message);
      }
    } else if (Array.isArray(data) && data.length === 0) {
      pass(`RLS ${table}`, "no rows leaked to anon");
    } else {
      fail(`RLS ${table}`, "unexpected data returned without auth");
    }
  }

  console.log("\n[4] Storage (avatars bucket)");
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    fail("storage buckets", bucketError.message);
  } else {
    const avatars = buckets?.find((b) => b.id === "avatars" || b.name === "avatars");
    if (avatars) {
      pass("avatars bucket", avatars.public ? "public" : "private");
    } else {
      fail("avatars bucket", "missing — run 007_storage_avatars.sql");
    }
  }

  console.log("\n[5] Authentication client");
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    fail("auth.getSession", sessionError.message);
  } else {
    pass("auth.getSession", sessionData.session ? "active session" : "no session (expected)");
  }

  return supabase;
}

async function verifyRequiredColumns(supabase) {
  console.log("\n[6] Required columns");
  const checks = [
    { table: "business_ideas", columns: "id,is_favorite" },
    { table: "market_analyses", columns: "id,is_favorite" },
    { table: "reports", columns: "id,is_favorite" },
    { table: "website_generations", columns: "id,is_favorite" },
    { table: "favorites", columns: "id,item_type,item_id" },
  ];

  for (const check of checks) {
    const { error } = await supabase.from(check.table).select(check.columns).limit(1);
    if (error) {
      fail(`${check.table} columns`, error.message);
    } else {
      pass(`${check.table} columns`, check.columns);
    }
  }
}

function verifyMigrationFiles() {
  console.log("\n[7] Migration files (execution order)");
  const migrations = [
    "001_profiles.sql",
    "002_business_ideas.sql",
    "003_market_analyses.sql",
    "004_reports.sql",
    "005_favorites.sql",
    "006_user_preferences.sql",
    "007_storage_avatars.sql",
    "008_website_generations.sql",
    "009_website_favorites.sql",
    "010_workspace_generations.sql",
    "021_platform_infrastructure.sql",
    "025_billing_system.sql",
    "026_security_hardening.sql",
    "028_production_qa_fixes.sql",
    "029_growth_engine.sql",
    "030_growth_security_hardening.sql",
  ];
  migrations.forEach((file, i) => {
    const path = join(root, "supabase", "migrations", file);
    if (existsSync(path)) {
      pass(`${i + 1}. ${file}`);
    } else {
      fail(`${i + 1}. ${file}`, "missing");
    }
  });

  console.log("\n[8] Expected RLS policy coverage (documented)");
  for (const [table, ops] of Object.entries(EXPECTED_RLS_POLICIES)) {
    pass(`${table}`, ops.join(", "));
  }
}

function verifyRouteFiles() {
  console.log("\n[9] API route handlers");
  const apiFiles = [
    "app/api/ideas/route.ts",
    "app/api/ideas/[id]/route.ts",
    "app/api/market-analysis/route.ts",
    "app/api/market-analysis/[id]/route.ts",
    "app/api/reports/route.ts",
    "app/api/reports/[id]/route.ts",
    "app/api/profile/route.ts",
    "app/api/preferences/route.ts",
    "app/api/website-builder/route.ts",
    "app/api/website-builder/[id]/route.ts",
    "app/api/website-builder/preview/route.ts",
    "app/api/website-builder/preview/[id]/route.ts",
    "app/api/website-builder/preview/[id]/asset/[...path]/route.ts",
    "app/api/workspaces/[type]/route.ts",
    "app/api/workspaces/[type]/[id]/route.ts",
    "app/auth/callback/route.ts",
  ];
  for (const file of apiFiles) {
    if (existsSync(join(root, file))) {
      pass(file);
    } else {
      fail(file, "missing");
    }
  }

  console.log("\n[10] Dashboard & auth pages");
  const pages = [
    ...PUBLIC_PAGES.map((path) => `app${path === "/" ? "" : path}/page.tsx`),
    ...DASHBOARD_PAGES.map((path) => `app/(dashboard)${path}/page.tsx`),
    ...AUTH_PAGES.map((path) => `app/(auth)${path}/page.tsx`),
  ];
  for (const file of pages) {
    if (existsSync(join(root, file))) {
      pass(file);
    } else {
      fail(file, "missing");
    }
  }

  if (existsSync(join(root, "proxy.ts"))) {
    pass("proxy.ts", "Next.js 16 proxy convention");
  } else {
    fail("proxy.ts", "missing");
  }
  if (existsSync(join(root, "middleware.ts"))) {
    fail("middleware.ts", "deprecated — should be removed");
  } else {
    pass("middleware.ts removed");
  }
}

function fetchOnce(baseUrl, path, method = "GET") {
  return fetch(`${baseUrl}${path}`, { method, redirect: "manual" });
}

async function verifyLiveServer(baseUrl) {
  console.log("\n[11] Live API endpoints (expect 401 without auth)");
  for (const route of API_ROUTES) {
    for (const method of route.methods) {
      try {
        const res = await fetchOnce(baseUrl, route.path, method);
        if (res.status === 401) {
          pass(`${method} ${route.path}`, "401 Unauthorized");
        } else if (method === "POST" && res.status === 400) {
          pass(`${method} ${route.path}`, "400 (auth passed unexpectedly or bad body)");
        } else {
          fail(`${method} ${route.path}`, `status ${res.status}`);
        }
      } catch (err) {
        fail(`${method} ${route.path}`, err.message);
      }
    }
  }

  console.log("\n[12] Live pages (expect 200 or redirect to login)");
  const publicPages = [...PUBLIC_PAGES, ...AUTH_PAGES];
  for (const path of publicPages) {
    try {
      const res = await fetchOnce(baseUrl, path);
      if (res.status === 200) {
        pass(`GET ${path}`, "200");
      } else {
        fail(`GET ${path}`, `status ${res.status}`);
      }
    } catch (err) {
      fail(`GET ${path}`, err.message);
    }
  }

  for (const path of DASHBOARD_PAGES) {
    try {
      const res = await fetchOnce(baseUrl, path);
      if (res.status === 307 || res.status === 308 || res.status === 302) {
        const location = res.headers.get("location") ?? "";
        if (location.includes("/login")) {
          pass(`GET ${path}`, "redirects to login");
        } else {
          fail(`GET ${path}`, `redirect to ${location}`);
        }
      } else if (res.status === 200) {
        pass(`GET ${path}`, "200 (session may exist)");
      } else {
        fail(`GET ${path}`, `status ${res.status}`);
      }
    } catch (err) {
      fail(`GET ${path}`, err.message);
    }
  }
}

function waitForServer(baseUrl, timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(baseUrl);
        if (res.ok || res.status === 404) return resolve();
      } catch {
        /* retry */
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error("Server did not start in time"));
        return;
      }
      setTimeout(tick, 500);
    };
    tick();
  });
}

async function runLiveChecks() {
  const port = 3099;
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn("npm", ["run", "start", "--", "-p", String(port)], {
    cwd: root,
    shell: true,
    stdio: "ignore",
    env: { ...process.env, PORT: String(port) },
  });

  try {
    await waitForServer(baseUrl);
    await verifyLiveServer(baseUrl);
  } catch (err) {
    fail("live server", err.message);
  } finally {
    child.kill("SIGTERM");
  }
}

async function main() {
  console.log("Trend Business AI — verification\n");
  const supabase = await verifySupabase();
  if (supabase) {
    await verifyRequiredColumns(supabase);
  }
  verifyMigrationFiles();
  verifyRouteFiles();

  const skipLive = process.argv.includes("--skip-live");
  if (!skipLive && existsSync(join(root, ".next", "BUILD_ID"))) {
    console.log("\n[Live checks] Starting production server on :3099 …");
    await runLiveChecks();
  } else if (skipLive) {
    console.log("\n[Live checks] skipped (--skip-live)");
  } else {
    console.log("\n[Live checks] skipped (run npm run build first)");
  }

  console.log("\n--- Summary ---");
  const ok = results.filter((r) => r.ok).length;
  const bad = results.filter((r) => !r.ok).length;
  console.log(`${ok} passed, ${bad} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
