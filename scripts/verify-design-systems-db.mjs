/**
 * Verify design_systems / design_presets / generated_designs exist.
 * Usage: node scripts/verify-design-systems-db.mjs
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

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const tables = ["design_presets", "design_systems", "generated_designs"];
const { rows: existing } = await client.query(
  `
  select table_name
  from information_schema.tables
  where table_schema = 'public'
    and table_name = any($1::text[])
  order by table_name
  `,
  [tables],
);

const found = new Set(existing.map((r) => r.table_name));
let failed = 0;
for (const table of tables) {
  if (found.has(table)) {
    console.log(`  ✓ public.${table}`);
  } else {
    failed++;
    console.log(`  ✗ public.${table} MISSING`);
  }
}

const { rows: presets } = await client.query(
  `select count(*)::int as n from public.design_presets`,
);
console.log(`  ✓ design_presets rows: ${presets[0].n}`);

const { rows: cols } = await client.query(
  `
  select column_name
  from information_schema.columns
  where table_schema = 'public' and table_name = 'design_systems'
  order by ordinal_position
  `,
);
console.log(
  `  ✓ design_systems columns: ${cols.map((c) => c.column_name).join(", ")}`,
);

const { rows: rls } = await client.query(
  `
  select relname, relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and relname = any($1::text[])
  `,
  [tables],
);
for (const row of rls) {
  if (row.relrowsecurity) console.log(`  ✓ RLS enabled on ${row.relname}`);
  else {
    failed++;
    console.log(`  ✗ RLS disabled on ${row.relname}`);
  }
}

await client.end();

if (failed) {
  console.error(`\nverify-design-systems-db: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-design-systems-db: OK");
