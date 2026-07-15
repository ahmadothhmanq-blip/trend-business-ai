/**
 * Apply pending SQL migrations via Postgres connection string.
 *
 * Required env (one of):
 *   SUPABASE_DB_URL
 *   DATABASE_URL
 *
 * Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI)
 * Use the "Session" or "Direct" connection (port 5432), not the Transaction pooler for DDL.
 *
 * Usage:
 *   node scripts/apply-migrations.mjs
 *   node scripts/apply-migrations.mjs --only 021,022,023,024
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
const migrationsDir = join(root, "supabase", "migrations");

const DEFAULT_PHASE14 = ["021", "022", "023", "024"];

function parseOnlyArg() {
  const idx = process.argv.indexOf("--only");
  if (idx === -1) return DEFAULT_PHASE14;
  const raw = process.argv[idx + 1];
  if (!raw) return DEFAULT_PHASE14;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function listMigrationFiles(prefixes) {
  const all = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  return all.filter((f) => prefixes.some((p) => f.startsWith(p + "_") || f.startsWith(p)));
}

async function ensureTracking(client) {
  await client.query(`
    create table if not exists public.schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    );
  `);
}

async function isApplied(client, id) {
  const { rows } = await client.query(
    `select 1 from public.schema_migrations where id = $1 limit 1`,
    [id],
  );
  return rows.length > 0;
}

async function markApplied(client, id) {
  await client.query(
    `insert into public.schema_migrations (id) values ($1) on conflict (id) do nothing`,
    [id],
  );
}

async function main() {
  if (!dbUrl) {
    console.error(`
Missing database connection string.

Add one of these to .env.local:
  SUPABASE_DB_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

Then re-run: node scripts/apply-migrations.mjs --only 021,022,023,024

Or paste supabase/APPLY_PHASE14.sql into the Supabase SQL Editor.
`);
    process.exit(2);
  }

  const prefixes = parseOnlyArg();
  const files = listMigrationFiles(prefixes);
  if (!files.length) {
    console.error("No migration files matched:", prefixes.join(", "));
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log("Connecting…");
  await client.connect();
  await ensureTracking(client);

  console.log(`Applying ${files.length} migration(s):\n`);
  for (const file of files) {
    const id = file.replace(/\.sql$/, "");
    if (await isApplied(client, id)) {
      console.log(`  skip  ${file} (already applied)`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    process.stdout.write(`  apply ${file} … `);
    try {
      await client.query("begin");
      await client.query(sql);
      await markApplied(client, id);
      await client.query("commit");
      console.log("OK");
    } catch (err) {
      await client.query("rollback");
      console.log("FAILED");
      console.error(`\n${file}: ${err.message}`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
