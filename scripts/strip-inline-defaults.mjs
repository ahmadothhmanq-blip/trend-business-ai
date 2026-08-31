import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "templates", "website");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function fix(source) {
  let r = source;
  // Remove multiline array defaults in destructuring: foo = [ ... ],
  r = r.replace(/(\n\s*)(\w+)\s*=\s*\[[\s\S]*?\],/g, "$1$2,");
  // Remove hardcoded flagship wrapper props
  r = r.replace(/\n\s+eyebrow="[^"]*"/g, "");
  r = r.replace(/\n\s+title="[^"]*"/g, "");
  r = r.replace(/\n\s+subtitle="[^"]*"/g, "");
  r = r.replace(/\n\s+email="[^"]*"/g, "");
  r = r.replace(/\n\s+phone="[^"]*"/g, "");
  r = r.replace(/\n\s+address="[^"]*"/g, "");
  r = r.replace(/\n\s+submitLabel="[^"]*"/g, "");
  r = r.replace(/\n\s+imageBadge="[^"]*"/g, "");
  r = r.replace(/\n\s+stats=\{\[[\s\S]*?\]\}/g, "");
  // Fix broken metrics conditional
  r = r.replace(
    /(\{metrics\?\.length \? \(\s*<dl[\s\S]*?<\/dl>)\s*(<\/div>)/g,
    "$1\n            ) : null}$2",
  );
  // Generic alt from title
  r = r.replace(/alt="Northline[^"]*"/g, 'alt={title ?? "Hero image"}');
  return r;
}

let n = 0;
for (const file of walk(ROOT)) {
  const orig = fs.readFileSync(file, "utf8");
  const next = fix(orig);
  if (next !== orig) {
    fs.writeFileSync(file, next);
    n++;
  }
}
console.log(`Fixed ${n} files`);
