/**
 * P0 Recent Projects browser verification — 10 consecutive create runs.
 * Playwright fallback when cursor-ide-browser MCP tab session is unavailable.
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();

const BASE = process.env.P0_VERIFY_BASE || "http://localhost:3003";
const EMAIL = process.env.E2E_TEST_EMAIL;
const PASSWORD = process.env.E2E_TEST_PASSWORD;
const RUNS = Number(process.env.P0_VERIFY_RUNS || 10);
const MAX_WAIT_MS = 120_000;

function todayDatePattern() {
  // Aug 4, 2026 9:xx PM (flexible locale)
  return /Aug\s*4,?\s*2026.*9:\d{2}\s*PM/i;
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  await emailInput.waitFor({ state: "visible", timeout: 30_000 });
  await emailInput.fill(EMAIL);
  await passwordInput.fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/\/dashboard/, { timeout: 60_000 });
}

async function waitForGenerationComplete(page) {
  const createBtn = page.getByRole("button", { name: /^Create Website$/i });
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    const enabled = await createBtn.isEnabled().catch(() => false);
    const bodyText = await page.locator("body").innerText().catch(() => "");
    const stillGenerating =
      /Generating website/i.test(bodyText) &&
      !/Generating website.*\n.*\n.*completed/i.test(bodyText);
    if (enabled && !stillGenerating) return { ok: true, ms: Date.now() - start };
    await page.waitForTimeout(3000);
  }
  return { ok: false, ms: Date.now() - start, reason: "timeout" };
}

function analyzeRecentProjects(bodyText, brief) {
  const sectionMatch = bodyText.match(
    /(?:Recent Projects|المشاريع الأخيرة)([\s\S]{0,4000})/i,
  );
  const section = sectionMatch?.[1] ?? bodyText;
  const lines = section.split("\n").map((l) => l.trim()).filter(Boolean);

  const titles = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (todayDatePattern().test(line) || /website\s*·/i.test(line)) {
      const title = lines[i - 1] || "";
      if (title && !/Recent Projects|المشاريع|Favorite|Export|Download/i.test(title)) {
        titles.push(title);
      }
    }
  }

  const headTitle = titles[0] || lines.find((l) => l.length > 3 && !/Aug|PM|website ·/i.test(l)) || "";
  const topHasToday = todayDatePattern().test(section.slice(0, 800));
  const duplicateTitle = titles.filter((t) => t === titles[0]).length > 1 ||
    (brief && titles.filter((t) => t.includes("micro bakery") || t.includes("P0 verify")).length > 1);

  return { headTitle, topHasToday, duplicateTitle, titles: titles.slice(0, 5) };
}

async function runOnce(page, i) {
  const brief = `P0 verify run ${i} micro bakery Oslo minimal`;
  const result = { run: i, pass: false, duplicate: false, headTitle: "", error: "" };

  try {
    if (!page.url().includes("/dashboard/website-builder")) {
      await page.goto(`${BASE}/dashboard/website-builder`, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
    }

    const textarea = page.locator("textarea").first();
    await textarea.waitFor({ state: "visible", timeout: 30_000 });
    await textarea.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(brief);

    const createBtn = page.getByRole("button", { name: /^Create Website$/i });
    await createBtn.click();

    const wait = await waitForGenerationComplete(page);
    if (!wait.ok) {
      result.error = wait.reason || "generation incomplete";
      return result;
    }

    const bodyText = await page.locator("body").innerText();
    const analysis = analyzeRecentProjects(bodyText, brief);
    result.headTitle = analysis.headTitle;
    result.duplicate = analysis.duplicateTitle;
    result.pass = analysis.topHasToday;
    if (!result.pass) result.error = "Recent Projects top entry missing today's date";
    return result;
  } catch (e) {
    result.error = e.message;
    return result;
  }
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error("Missing E2E_TEST_EMAIL / E2E_TEST_PASSWORD in .env.local");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`P0 Recent Projects verify — ${RUNS} runs @ ${BASE}`);
  console.log("NOTE: Playwright fallback (cursor-ide-browser MCP tab session unavailable in subagent)");

  await login(page);
  await page.goto(`${BASE}/dashboard/website-builder`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });

  const results = [];
  for (let i = 1; i <= RUNS; i++) {
    console.log(`\n--- Run ${i}/${RUNS} ---`);
    const r = await runOnce(page, i);
    results.push(r);
    console.log(JSON.stringify(r));
  }

  await browser.close();

  console.log("\n=== SUMMARY TABLE ===");
  console.log("| Run | Pass | Duplicate | Head Project Title | Error |");
  console.log("|-----|------|-----------|-------------------|-------|");
  for (const r of results) {
    console.log(
      `| ${r.run} | ${r.pass ? "PASS" : "FAIL"} | ${r.duplicate ? "YES" : "NO"} | ${(r.headTitle || "—").slice(0, 40)} | ${(r.error || "—").slice(0, 40)} |`,
    );
  }

  const passed = results.filter((r) => r.pass).length;
  console.log(`\nTotal: ${passed}/${RUNS} passed`);
  process.exit(passed === RUNS ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
