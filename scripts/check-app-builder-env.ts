import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const keys = [
  "DEEPSEEK_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "WEBAPP_DEPLOY_ENABLED",
  "WEBAPP_PUBLISH_ENABLED",
  "SUPABASE_DB_URL",
];

const booleanFlags = new Set([
  "WEBAPP_DEPLOY_ENABLED",
  "WEBAPP_PUBLISH_ENABLED",
]);

function loadEnvFile(name: string): Record<string, string> {
  const path = join(process.cwd(), name);
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
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
    out[k] = v;
  }
  return out;
}

const env = { ...loadEnvFile(".env"), ...loadEnvFile(".env.local") };
for (const key of keys) {
  const value = env[key] ?? "";
  let status: string;
  if (booleanFlags.has(key)) {
    const on = /^(1|true|yes|on)$/i.test(value);
    const off = /^(0|false|no|off)$/i.test(value);
    status = on ? "SET(true)" : off ? "SET(false)" : "MISSING_OR_PLACEHOLDER";
  } else {
    const placeholder =
      !value ||
      /^your-/i.test(value) ||
      /your-project/i.test(value) ||
      value.length < 8;
    status = placeholder ? "MISSING_OR_PLACEHOLDER" : "SET";
  }
  console.log(`${key}: ${status}`);
}
