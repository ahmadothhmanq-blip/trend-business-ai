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
 *   npm run db:apply                         # apply all pending 001–030
 *   npm run db:apply -- --only 021,022,023,024
 *   npm run db:apply -- --only 001-030       # range (same as all)
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

function migrationNumericId(filename) {
  const base = filename.replace(/\.sql$/, "");
  const prefix = base.split("_")[0] ?? "";
  return prefix;
}

function normalizePrefix(p) {
  const trimmed = String(p).trim();
  if (!trimmed) return "";
  if (/^\d+$/.test(trimmed)) return trimmed.padStart(3, "0");
  return trimmed;
}

function expandOnlyArg(raw) {
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const part of parts) {
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      const lo = Math.min(start, end);
      const hi = Math.max(start, end);
      for (let n = lo; n <= hi; n++) out.push(String(n).padStart(3, "0"));
      continue;
    }
    out.push(normalizePrefix(part));
  }
  return [...new Set(out)];
}

function parseOnlyArg() {
  const idx = process.argv.indexOf("--only");
  if (idx === -1) return null; // all migrations
  const raw = process.argv[idx + 1];
  if (!raw) return null;
  return expandOnlyArg(raw);
}

function listAllMigrationFiles() {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => migrationNumericId(a).localeCompare(migrationNumericId(b)));
}

function listMigrationFiles(prefixes) {
  const all = listAllMigrationFiles();
  if (!prefixes) return all;
  const wanted = new Set(prefixes.map(normalizePrefix));
  return all.filter((f) => wanted.has(migrationNumericId(f)));
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

Then re-run: npm run db:apply
`);
    process.exit(2);
  }

  const prefixes = parseOnlyArg();
  const files = listMigrationFiles(prefixes);
  if (!files.length) {
    console.error("No migration files matched:", prefixes?.join(", ") ?? "(all)");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log("Connecting…");
  await client.connect();
  await ensureTracking(client);

  // Ensure pgcrypto for gen_random_bytes used by later migrations
  try {
    await client.query(`create extension if not exists pgcrypto with schema extensions`);
  } catch {
    try {
      await client.query(`create extension if not exists pgcrypto`);
    } catch {
      // Supabase usually has this already
    }
  }

  console.log(`Applying ${files.length} migration(s):\n`);
  let applied = 0;
  let skipped = 0;
  for (const file of files) {
    const id = file.replace(/\.sql$/, "");
    if (await isApplied(client, id)) {
      console.log(`  skip  ${file} (already applied)`);
      skipped++;
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
      applied++;
    } catch (err) {
      await client.query("rollback");
      console.log("FAILED");
      console.error(`\n${file}: ${err.message}`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log(`\nDone. applied=${applied} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
