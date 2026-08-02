/**
 * Collaborator editing smoke — verifies private helper + RLS policy on staging DB.
 * Usage: node scripts/smoke-collaborator-editing.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const rel of [".env.staging", ".env.local"]) {
  const path = join(root, rel);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL");
  process.exit(2);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

let failed = 0;
function ok(msg) {
  console.log(`  PASS  ${msg}`);
}
function bad(msg) {
  failed++;
  console.log(`  FAIL  ${msg}`);
}

console.log("\n=== Collaborator editing smoke ===\n");

const fn = await client.query(
  `select 1 from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'private' and p.proname = 'can_edit_website_generation'`,
);
fn.rows.length ? ok("private.can_edit_website_generation exists") : bad("private.can_edit_website_generation missing");

const pol = await client.query(
  `select polname from pg_policy pol
   join pg_class c on c.oid = pol.polrelid
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'website_generations'
     and pol.polcmd = 'w' and pol.polname ilike '%editor%'`,
);
pol.rows.length
  ? ok(`UPDATE policy: ${pol.rows[0].polname}`)
  : bad("Editors can update shared website generations policy missing");

const member = await client.query(
  `select m.generation_id, m.user_id, m.role, wg.user_id as owner_id
   from public.website_generation_members m
   join public.website_generations wg on wg.id = m.generation_id
   where m.status = 'accepted' and m.role = 'editor'
   limit 1`,
);

if (member.rows.length) {
  const { generation_id, user_id } = member.rows[0];
  const canEdit = await client.query(
    `select private.can_edit_website_generation($1::uuid, $2::uuid) as allowed`,
    [generation_id, user_id],
  );
  canEdit.rows[0]?.allowed
    ? ok(`editor member can_edit=true (generation=${generation_id})`)
    : bad(`editor member can_edit=false (generation=${generation_id})`);

  const viewerOnly = await client.query(
    `select m.user_id
     from public.website_generation_members m
     where m.generation_id = $1::uuid and m.status = 'accepted' and m.role = 'viewer'
     limit 1`,
    [generation_id],
  );
  if (viewerOnly.rows.length) {
    const viewerId = viewerOnly.rows[0].user_id;
    const viewerEdit = await client.query(
      `select private.can_edit_website_generation($1::uuid, $2::uuid) as allowed`,
      [generation_id, viewerId],
    );
    !viewerEdit.rows[0]?.allowed
      ? ok("viewer member can_edit=false (expected)")
      : bad("viewer incorrectly allowed to edit");
  } else {
    ok("no viewer member in sample — skipped viewer denial check");
  }
} else {
  ok("no accepted editor memberships in DB — policy + function checks only");
}

await client.end();

if (failed) {
  console.log(`\nsmoke-collaborator-editing: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nsmoke-collaborator-editing: PASS");
