/**
 * Local E2E auth bootstrap only.
 * Ensures NEXT_PUBLIC_SITE_URL + a confirmed test user that can sign in.
 * Does not change app/production Auth settings (email confirmation stays on).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const envPath = resolve(process.cwd(), ".env.local");

function loadEnvLocal() {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    }
  }
}

function upsertEnvLocal(key, value) {
  const raw = readFileSync(envPath, "utf8");
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(raw)) {
    writeFileSync(envPath, raw.replace(re, line), "utf8");
  } else {
    appendFileSync(envPath, `\n${line}\n`, "utf8");
  }
  process.env[key] = value;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.SUPABASE_DB_URL;

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  upsertEnvLocal("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
  console.log("SET NEXT_PUBLIC_SITE_URL=http://localhost:3000");
} else {
  console.log("OK NEXT_PUBLIC_SITE_URL=", process.env.NEXT_PUBLIC_SITE_URL);
}

if (!url || !anon) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const password =
  process.env.E2E_TEST_PASSWORD || `WbE2E!Local${Date.now().toString().slice(-6)}aA1`;
let email = process.env.E2E_TEST_EMAIL || "";

const anonClient = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function withDb(fn) {
  if (!dbUrl) throw new Error("SUPABASE_DB_URL required for local E2E confirm");
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** Confirm + set password for an existing auth user (local ops). */
async function confirmAndSetPassword(targetEmail, newPassword) {
  return withDb(async (client) => {
    const result = await client.query(
      `update auth.users
       set encrypted_password = crypt($2, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
       where email = $1
       returning id, email, email_confirmed_at is not null as confirmed`,
      [targetEmail, newPassword],
    );
    if (!result.rowCount) {
      throw new Error(`No auth.users row for ${targetEmail}`);
    }
    return result.rows[0];
  });
}

async function pickExistingTestEmail() {
  return withDb(async (client) => {
    const result = await client.query(
      `select email
       from auth.users
       where email like 'wb.%@gmail.com'
          or email like 'qa.phase20.%@gmail.com'
          or email = $1
       order by created_at desc
       limit 1`,
      [process.env.E2E_TEST_EMAIL || ""],
    );
    return result.rows[0]?.email || null;
  });
}

async function createViaServiceRole(targetEmail, targetPassword) {
  if (!service) return null;
  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.auth.admin.createUser({
    email: targetEmail,
    password: targetPassword,
    email_confirm: true,
    user_metadata: { full_name: "WB E2E Local" },
  });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) return "exists";
    throw new Error(`createUser: ${error.message}`);
  }
  return data.user?.id || null;
}

async function main() {
  // Prefer explicit email; otherwise try signup; on rate-limit reuse existing test user.
  if (!email) {
    email = `wb.e2e.local@gmail.com`;
  }

  let created = false;
  if (service) {
    const id = await createViaServiceRole(email, password);
    if (id && id !== "exists") {
      created = true;
      console.log("CREATED confirmed user via service role");
    }
  }

  if (!created) {
    const { data: su, error: suErr } = await anonClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: "WB E2E Local" } },
    });
    if (suErr) {
      if (/rate limit/i.test(suErr.message)) {
        const existing = await pickExistingTestEmail();
        if (!existing) {
          throw new Error(
            "Signup rate-limited and no reusable wb.* test user found in auth.users",
          );
        }
        email = existing;
        console.log("RATE_LIMIT reuse existing user", email);
      } else if (!/already|registered|exists/i.test(suErr.message)) {
        throw new Error(`signUp: ${suErr.message}`);
      } else {
        console.log("User already registered", email);
      }
    } else if (su.session) {
      console.log("Signup issued session (project has confirm disabled)");
    } else {
      console.log("Signup ok; confirming via DB/admin");
    }
  }

  // Always confirm + sync password so sign-in is deterministic for E2E
  if (dbUrl) {
    const row = await confirmAndSetPassword(email, password);
    console.log("CONFIRMED", row.email, "confirmed=", row.confirmed);
  } else if (service) {
    const admin = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: listed, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw new Error(listErr.message);
    const user = listed.users.find((u) => u.email === email);
    if (!user) throw new Error(`User not found for admin confirm: ${email}`);
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      password,
    });
    if (error) throw new Error(error.message);
    console.log("CONFIRMED via service role", email);
  } else {
    throw new Error("Need SUPABASE_DB_URL or SUPABASE_SERVICE_ROLE_KEY to confirm test user");
  }

  const { data: si, error: siErr } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });
  if (siErr || !si.session) {
    throw new Error(`signIn failed after confirm: ${siErr?.message || "no session"}`);
  }

  upsertEnvLocal("E2E_TEST_EMAIL", email);
  upsertEnvLocal("E2E_TEST_PASSWORD", password);
  console.log("AUTH_OK");
}

main().catch((e) => {
  console.error("AUTH_BOOTSTRAP_FAIL", e.message);
  process.exit(1);
});
