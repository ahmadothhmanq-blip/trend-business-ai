import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

const { sanitizeDesignScaffold } = await import(
  "../lib/website/template-v2/loader/sanitize-design-scaffold.ts"
);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const root = join(process.cwd(), "templates/website");
const files = walk(root);
let slowest = { ms: 0, path: "" };
for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const t0 = performance.now();
  sanitizeDesignScaffold(raw, "test");
  const ms = performance.now() - t0;
  if (ms > slowest.ms) slowest = { ms, path: file };
  if (ms > 500) console.log("SLOW", ms.toFixed(0), "ms", file);
}
console.log("files", files.length, "slowest", slowest);
