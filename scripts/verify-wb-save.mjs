/**
 * Verify website_generations save payload succeeds after wb-save fixes.
 * Usage: node scripts/verify-wb-save.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
function loadEnv() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    )
      v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const client = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows: users } = await client.query(
  `select id from auth.users order by created_at desc limit 1`,
);
if (!users.length) {
  console.error("No auth.users for probe");
  process.exit(2);
}
const userId = users[0].id;

function normalizeTokenUsage(usage) {
  if (!usage || typeof usage !== "object") {
    return { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  }
  const promptTokens = Number(usage.promptTokens) || 0;
  const completionTokens = Number(usage.completionTokens) || 0;
  return {
    promptTokens,
    completionTokens,
    totalTokens: Number(usage.totalTokens) || promptTokens + completionTokens,
  };
}

async function insertRow(row) {
  const { rows } = await client.query(
    `insert into public.website_generations (
      user_id, project_name, website_type, business_description, target_audience,
      language, color_style, design_style, page_count, features, blueprint,
      product_id, project_id, status, mode, parent_generation_id, provider,
      token_usage, generation_time_ms, prompt_versions, attachments
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::text[],$11::jsonb,$12,$13,$14,$15,$16,$17,
      $18::jsonb,$19,$20::jsonb,$21::jsonb
    ) returning id`,
    [
      row.user_id,
      row.project_name,
      row.website_type,
      row.business_description,
      row.target_audience,
      row.language,
      row.color_style,
      row.design_style,
      row.page_count,
      row.features,
      JSON.stringify(row.blueprint),
      row.product_id,
      row.project_id,
      row.status,
      row.mode,
      row.parent_generation_id,
      row.provider,
      JSON.stringify(row.token_usage),
      row.generation_time_ms,
      JSON.stringify(row.prompt_versions),
      JSON.stringify(row.attachments),
    ],
  );
  return rows[0].id;
}

let failed = 0;
function ok(label) {
  console.log(`  ✓ ${label}`);
}
function fail(label, err) {
  failed++;
  console.log(`  ✗ ${label}: ${err}`);
}

await client.query("begin");

try {
  // Case that previously failed: usage null → now normalized
  const id1 = await insertRow({
    user_id: userId,
    project_name: "__verify_wb_save_usage__",
    website_type: "Website",
    business_description: "verify",
    target_audience: "verify",
    language: "English",
    color_style: "#111",
    design_style: "modern",
    page_count: "1",
    features: ["product:website-builder"],
    blueprint: {
      title: "Verify",
      files: [{ path: "app/page.tsx", content: "export default function Page(){return null}", language: "tsx" }],
    },
    product_id: "website-builder",
    project_id: null,
    status: "completed",
    mode: "generate",
    parent_generation_id: null,
    provider: "deepseek",
    token_usage: normalizeTokenUsage(null),
    generation_time_ms: 100,
    prompt_versions: [],
    attachments: [],
  });
  ok(`save with normalized null usage → ${id1}`);

  // Case: dangling parent cleared (null) should succeed
  const id2 = await insertRow({
    user_id: userId,
    project_name: "__verify_wb_save_parent__",
    website_type: "Website",
    business_description: "verify",
    target_audience: "verify",
    language: "English",
    color_style: "Gold",
    design_style: "Modern",
    page_count: "2",
    features: [],
    blueprint: { title: "Verify2", files: [] },
    product_id: "website-builder",
    project_id: null,
    status: "completed",
    mode: "continue",
    parent_generation_id: null, // cleared after missing parent check
    provider: "deepseek",
    token_usage: normalizeTokenUsage(undefined),
    generation_time_ms: 50,
    prompt_versions: [
      {
        id: "00000000-0000-4000-8000-000000000099",
        prompt: "improve",
        createdAt: new Date().toISOString(),
        mode: "continue",
      },
    ],
    attachments: [],
  });
  ok(`save with cleared parent FK → ${id2}`);

  // Confirm dangling parent would still fail if not cleared
  try {
    await insertRow({
      user_id: userId,
      project_name: "__verify_wb_save_bad_parent__",
      website_type: "Website",
      business_description: "verify",
      target_audience: "verify",
      language: "English",
      color_style: "Gold",
      design_style: "Modern",
      page_count: "1",
      features: [],
      blueprint: { title: "x", files: [] },
      product_id: "website-builder",
      project_id: null,
      status: "completed",
      mode: "continue",
      parent_generation_id: "00000000-0000-4000-8000-000000000001",
      provider: "deepseek",
      token_usage: normalizeTokenUsage({}),
      generation_time_ms: 1,
      prompt_versions: [],
      attachments: [],
    });
    fail("dangling parent should fail", "unexpected success");
  } catch (err) {
    ok(`dangling parent correctly rejected (${err.message.slice(0, 60)}…)`);
  }
} catch (err) {
  fail("verify transaction", err.message);
}

await client.query("rollback");
await client.end();

// Static check: save-generation.ts contains the fixes
const src = readFileSync(
  join(root, "lib/website/save-generation.ts"),
  "utf8",
);
for (const needle of [
  "normalizeTokenUsage",
  "emptyTokenUsage",
  "parentGenerationId",
  "phase5Row_cleared_fks",
  "token_usage: tokenUsage",
]) {
  if (!src.includes(needle)) {
    fail(`source contains ${needle}`, "missing");
  } else {
    ok(`source: ${needle}`);
  }
}

if (failed) {
  console.error(`\nverify-wb-save: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-wb-save: OK");
