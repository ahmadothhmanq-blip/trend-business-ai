const base = process.env.QA_BASE || "http://localhost:3000";

async function hit(m, p, body, extra = {}) {
  const opts = {
    method: m,
    redirect: "manual",
    headers: { "Content-Type": "application/json", ...(extra.headers || {}) },
  };
  if (body !== undefined) opts.body = typeof body === "string" ? body : JSON.stringify(body);
  const t = Date.now();
  let r;
  let err;
  try {
    r = await fetch(base + p, opts);
  } catch (e) {
    err = e.message;
  }
  const ms = Date.now() - t;
  let j = "";
  if (r) {
    try {
      j = (await r.text()).slice(0, 200).replace(/\s+/g, " ");
    } catch {
      /* ignore */
    }
  }
  console.log([m, r ? r.status : "ERR", `${ms}ms`, p, err || j].join(" | "));
  return { status: r ? r.status : 0, loc: r?.headers.get("location") || "", body: j, ms };
}

const results = { pass: 0, fail: 0, notes: [] };

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

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];
const PUBLIC_PAGES = [
  "/",
  "/pricing",
  "/features",
  "/about",
  "/contact",
  "/blog",
  "/faq",
  "/learn",
  "/privacy",
  "/terms",
  "/use-cases",
  "/compare",
  "/services",
  "/industries",
  "/countries",
  "/use-cases/startup-website",
  "/compare/ai-business-suite",
  "/services/seo-growth",
  "/industries/saas",
  "/countries/united-states",
  "/products/website-builder",
  "/products/landing-page-builder",
  "/products/app-builder",
  "/products/logo-maker",
  "/products/brand-studio",
  "/products/image-generator",
  "/products/video-studio",
  "/products/content-studio",
  "/products/marketing-ai",
  "/products/business-intelligence",
  "/products/feasibility-study",
  "/products/social-media-manager",
];
const DASHBOARD_PAGES = [
  "/dashboard",
  "/dashboard/projects",
  "/dashboard/website-builder",
  "/dashboard/landing-page-builder",
  "/dashboard/app-builder",
  "/dashboard/logo-maker",
  "/dashboard/brand-studio",
  "/dashboard/image-generator",
  "/dashboard/video-studio",
  "/dashboard/content-studio",
  "/dashboard/social-media",
  "/dashboard/marketing",
  "/dashboard/business-intelligence",
  "/dashboard/feasibility-study",
  "/dashboard/ai-agents",
  "/dashboard/templates",
  "/dashboard/history",
  "/dashboard/files",
  "/dashboard/analytics",
  "/dashboard/seo",
  "/dashboard/growth",
  "/dashboard/billing",
  "/dashboard/ai-providers",
  "/dashboard/team",
  "/dashboard/notifications",
  "/dashboard/api-keys",
  "/dashboard/usage",
  "/dashboard/settings",
  "/dashboard/ideas",
  "/dashboard/market-analysis",
  "/dashboard/reports",
  "/dashboard/favorites",
  "/dashboard/profile",
  "/dashboard/admin",
  "/dashboard/search",
  "/dashboard/subscription",
  "/dashboard/business-audit",
  "/dashboard/business-manager",
  "/dashboard/creative-studio",
  "/dashboard/brand-designer",
];

const AI_APIS = [
  "/api/website-builder",
  "/api/landing-page-builder",
  "/api/webapp-builder",
  "/api/logo-designer",
  "/api/brand-identity",
  "/api/image-generator",
  "/api/video-studio",
  "/api/content-studio",
  "/api/business-suite",
  "/api/ai-agents",
  "/api/ideas",
  "/api/market-analysis",
  "/api/reports",
];

const PLATFORM_APIS = [
  "/api/platform/billing",
  "/api/platform/usage",
  "/api/platform/plans",
  "/api/platform/notifications",
  "/api/platform/team",
  "/api/platform/organizations",
  "/api/platform/api-keys",
  "/api/platform/activity",
  "/api/platform/admin",
  "/api/profile",
  "/api/preferences",
  "/api/growth/dashboard",
  "/api/growth/crm",
  "/api/growth/referrals",
  "/api/growth/actions",
  "/api/seo/health",
];

async function main() {
  console.log("=== Phase 20 Functional QA ===");
  console.log("Base:", base);

  // Auth pages
  for (const p of AUTH_PAGES) {
    const r = await hit("GET", p);
    record(r.status === 200, `Auth page ${p} => ${r.status}`);
  }

  // Public pages
  for (const p of PUBLIC_PAGES) {
    const r = await hit("GET", p);
    record(r.status === 200, `Public ${p} => ${r.status} (${r.ms}ms)`);
  }

  // Dashboard protection
  for (const p of DASHBOARD_PAGES) {
    const r = await hit("GET", p);
    const ok = (r.status === 307 || r.status === 302) && r.loc.includes("/login");
    record(ok, `Protected ${p} => ${r.status} ${r.loc.slice(0, 60)}`);
  }

  // Health
  {
    const r = await hit("GET", "/api/health");
    record(r.status === 200, `Health API => ${r.status}`);
  }

  // Unauth AI APIs must reject
  for (const p of AI_APIS) {
    const r = await hit("GET", p);
    record([401, 405, 400].includes(r.status), `Unauth GET ${p} => ${r.status}`);
    const post = await hit("POST", p, { prompt: "test" });
    record([401, 400, 403, 405, 422].includes(post.status), `Unauth POST ${p} => ${post.status}`);
  }

  // Platform APIs unauth
  for (const p of PLATFORM_APIS) {
    const r = await hit("GET", p);
    record([401, 403, 405].includes(r.status), `Unauth ${p} => ${r.status}`);
  }

  // Growth public APIs
  {
    const lead = await hit("POST", "/api/growth/leads", {
      email: "qa-phase20@example.com",
      name: "QA",
      source: "contact",
      message: "Enterprise QA lead capture validation message long enough.",
      pagePath: "/contact",
      honeypot: "",
    });
    record(lead.status === 200 && lead.body.includes('"ok":true'), `Lead capture => ${lead.status}`);

    const bad = await hit("POST", "/api/growth/leads", { email: "bad", source: "contact" });
    record(bad.status === 400, `Lead validation => ${bad.status}`);

    const honey = await hit("POST", "/api/growth/leads", {
      email: "bot@example.com",
      source: "contact",
      honeypot: "x",
    });
    record(honey.status === 200 && honey.body.includes("ignored"), `Lead honeypot => ${honey.status}`);

    const news = await hit("POST", "/api/growth/newsletter", {
      email: "qa-news@example.com",
      source: "newsletter",
      honeypot: "",
    });
    record(news.status === 200, `Newsletter => ${news.status}`);

    const ev = await hit("POST", "/api/growth/events", {
      eventName: "page_view",
      eventCategory: "engagement",
      pagePath: "/",
    });
    record(ev.status === 200, `Events => ${ev.status}`);
  }

  // SEO assets
  for (const p of [
    "/robots.txt",
    "/sitemap.xml",
    "/sitemaps/index.xml",
    "/sitemaps/tools.xml",
    "/sitemaps/blog.xml",
    "/sitemaps/industries.xml",
    "/sitemaps/countries.xml",
    "/sitemaps/services.xml",
    "/manifest.webmanifest",
  ]) {
    const r = await hit("GET", p);
    record(r.status === 200, `SEO asset ${p} => ${r.status}`);
  }

  // Metadata HTML checks
  for (const p of ["/", "/pricing", "/contact", "/blog", "/faq"]) {
    const res = await fetch(base + p);
    const h = await res.text();
    const title = (h.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1];
    const hasOg = /property=["']og:title["']/i.test(h) || /name=["']og:title["']/i.test(h);
    const hasCanon = /rel=["']canonical["']/i.test(h);
    const hasLd = /application\/ld\+json/i.test(h);
    record(Boolean(title), `Title on ${p}: ${title || "MISSING"}`);
    record(hasOg, `OpenGraph on ${p}`);
    record(hasCanon, `Canonical on ${p}`);
    record(hasLd, `JSON-LD on ${p}`);
  }

  // robots content
  {
    const r = await fetch(base + "/robots.txt");
    const t = await r.text();
    record(/sitemap/i.test(t) || t.length > 0, `robots.txt content (${t.trim()})`);
  }

  // Performance spot checks
  const perfPages = ["/", "/pricing", "/contact", "/login", "/api/health"];
  for (const p of perfPages) {
    const times = [];
    for (let i = 0; i < 3; i++) {
      const t0 = Date.now();
      await fetch(base + p, { redirect: "manual" });
      times.push(Date.now() - t0);
    }
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    record(avg < 5000, `Perf ${p} avg ${avg}ms [${times.join(",")}]`);
  }

  console.log("\n=== SUMMARY ===");
  console.log("Passed:", results.pass);
  console.log("Failed:", results.fail);
  if (results.notes.length) {
    console.log("Failures:");
    for (const n of results.notes) console.log(" -", n);
  }
  const score = Math.round((results.pass / (results.pass + results.fail)) * 100);
  console.log("Score:", score);
  process.exitCode = results.fail > 0 ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
