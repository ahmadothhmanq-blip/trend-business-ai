/**
 * Integration tests for website_experiments persistence (C1 fix).
 * Usage: npm run verify:website-experiments
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { randomUUID } from "node:crypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL / DATABASE_URL");
  process.exit(2);
}

let failed = 0;
function ok(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed++;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

console.log("\n[1] Source structure");
const storeSrc = readFileSync(
  join(root, "lib/ai-core/ab-testing/store.ts"),
  "utf8",
);
const repoSrc = readFileSync(
  join(root, "lib/ai-core/ab-testing/repository.ts"),
  "utf8",
);

if (storeSrc.includes("globalThis")) {
  fail("store.ts must not use globalThis");
} else {
  ok("store.ts has no globalThis");
}

if (!storeSrc.includes("website_experiments") && !storeSrc.includes("insertExperimentDb")) {
  fail("store.ts must use repository persistence");
} else {
  ok("store.ts delegates to repository");
}

for (const needle of [
  "listExperimentsDb",
  "getExperimentDb",
  "insertExperimentDb",
  "updateExperimentDb",
  "deleteExperimentDb",
  "rowToExperiment",
]) {
  if (repoSrc.includes(needle)) ok(`repository: ${needle}`);
  else fail(`repository missing ${needle}`);
}

console.log("\n[2] Database table");
const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows: tableRows } = await client.query(
  `
  select table_name
  from information_schema.tables
  where table_schema = 'public' and table_name = 'website_experiments'
  `,
);
if (tableRows.length) ok("public.website_experiments exists");
else fail("public.website_experiments missing");

const { rows: users } = await client.query(
  `select id from auth.users order by created_at desc limit 1`,
);
if (!users.length) {
  fail("no auth.users for integration probe");
  await client.end();
  process.exit(1);
}
const userId = users[0].id;

const { rows: gens } = await client.query(
  `select id from public.website_generations where user_id = $1 limit 1`,
  [userId],
);
let generationId = gens[0]?.id;
if (!generationId) {
  const { rows: inserted } = await client.query(
    `
    insert into public.website_generations (
      user_id, project_name, website_type, business_description, target_audience,
      language, color_style, design_style, page_count, features, blueprint,
      product_id, status, mode, provider, token_usage, generation_time_ms
    ) values (
      $1, '__verify_experiments__', 'Website', 'verify', 'verify',
      'English', 'Gold', 'Modern', '1', '{}', '{"title":"Verify","files":[]}'::jsonb,
      'website-builder', 'completed', 'generate', 'deepseek',
      '{"promptTokens":0,"completionTokens":0,"totalTokens":0}'::jsonb, 1
    ) returning id
    `,
    [userId],
  );
  generationId = inserted[0].id;
  ok(`created probe generation ${generationId}`);
} else {
  ok(`using existing generation ${generationId}`);
}

const variantAId = `var-a-${Date.now()}`;
const variantBId = `var-b-${Date.now()}`;
const experimentId = randomUUID();
const now = new Date().toISOString();
const variants = [
  {
    id: variantAId,
    key: "A",
    name: "Control",
    weight: 50,
    changes: [],
    impressions: 10,
    conversions: 2,
    clicks: 5,
  },
  {
    id: variantBId,
    key: "B",
    name: "Challenger",
    weight: 50,
    changes: [{ type: "headline", target: "hero", variantValue: "Test" }],
    impressions: 12,
    conversions: 4,
    clicks: 6,
  },
];

console.log("\n[3] CRUD integration (transactional)");

await client.query("begin");

try {
  // CREATE
  await client.query(
    `
    insert into public.website_experiments (
      id, generation_id, user_id, name, hypothesis, status, change_types,
      variants, min_sample_size, confidence_threshold, started_at, created_at, updated_at
    ) values (
      $1, $2, $3, $4, $5, 'running', $6::text[], $7::jsonb, 40, 0.9, $8, $8, $8
    )
    `,
    [
      experimentId,
      generationId,
      userId,
      "__verify_experiment__",
      "Verify persistence",
      ["headline"],
      JSON.stringify(variants),
      now,
    ],
  );
  ok("CREATE experiment");

  // READ
  const { rows: readRows } = await client.query(
    `select * from public.website_experiments where id = $1`,
    [experimentId],
  );
  if (readRows.length !== 1) {
    fail("READ experiment", "row not found");
  } else {
    const row = readRows[0];
    if (row.name === "__verify_experiment__" && row.status === "running") {
      ok("READ experiment");
    } else {
      fail("READ experiment", "unexpected row shape");
    }
  }

  // UPDATE
  const updatedVariants = JSON.parse(JSON.stringify(variants));
  updatedVariants[0].impressions = 99;
  const updatedAt = new Date().toISOString();
  await client.query(
    `
    update public.website_experiments
    set variants = $2::jsonb, status = 'paused', updated_at = $3
    where id = $1
    `,
    [experimentId, JSON.stringify(updatedVariants), updatedAt],
  );
  const { rows: updatedRows } = await client.query(
    `select status, variants from public.website_experiments where id = $1`,
    [experimentId],
  );
  const parsedVariants = updatedRows[0]?.variants;
  if (
    updatedRows[0]?.status === "paused" &&
    parsedVariants?.[0]?.impressions === 99
  ) {
    ok("UPDATE experiment");
  } else {
    fail("UPDATE experiment", "metrics not persisted");
  }

  // DELETE
  await client.query(`delete from public.website_experiments where id = $1`, [
    experimentId,
  ]);
  const { rows: deletedRows } = await client.query(
    `select id from public.website_experiments where id = $1`,
    [experimentId],
  );
  if (deletedRows.length === 0) ok("DELETE experiment");
  else fail("DELETE experiment", "row still exists");
} catch (err) {
  fail("CRUD transaction", err instanceof Error ? err.message : String(err));
}

await client.query("rollback");

console.log("\n[4] Restart simulation (commit + reconnect)");

const persistId = randomUUID();
const persistNow = new Date().toISOString();
await client.query("begin");
try {
  await client.query(
    `
    insert into public.website_experiments (
      id, generation_id, user_id, name, hypothesis, status, change_types,
      variants, min_sample_size, confidence_threshold, created_at, updated_at
    ) values (
      $1, $2, $3, '__restart_probe__', 'restart', 'draft', '{}',
      '[]'::jsonb, 40, 0.9, $4, $4
    )
    `,
    [persistId, generationId, userId, persistNow],
  );
  await client.query("commit");
  ok("committed experiment for restart probe");
} catch (err) {
  await client.query("rollback");
  fail("restart commit", err instanceof Error ? err.message : String(err));
}

await client.end();

const client2 = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});
await client2.connect();

const { rows: restartRows } = await client2.query(
  `select name, status from public.website_experiments where id = $1`,
  [persistId],
);
if (
  restartRows.length === 1 &&
  restartRows[0].name === "__restart_probe__" &&
  restartRows[0].status === "draft"
) {
  ok("RESTART simulation — data persisted after reconnect");
} else {
  fail("RESTART simulation", "experiment missing after reconnect");
}

await client2.query(`delete from public.website_experiments where id = $1`, [
  persistId,
]);
await client2.end();

if (failed) {
  console.error(`\nverify-website-experiments: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-experiments: OK");
