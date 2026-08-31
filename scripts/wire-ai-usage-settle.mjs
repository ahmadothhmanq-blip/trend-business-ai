import fs from "node:fs";
import path from "node:path";

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === "route.ts") out.push(full);
  }
  return out;
}

const files = walk("app/api").filter((file) => {
  const src = fs.readFileSync(file, "utf8");
  return src.includes("creditLease") && src.includes("beginAiUsage");
});

let changed = 0;
for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;

  // Insert release at the start of catch blocks that follow creditLease usage.
  if (!src.includes("creditLease.release")) {
    src = src.replace(
      /catch\s*\((\w+)\)\s*\{/g,
      (match, errName, offset) => {
        const ahead = src.slice(Math.max(0, offset - 800), offset);
        if (!ahead.includes("creditLease")) return match;
        if (ahead.includes("creditLease.release")) return match;
        return `catch (${errName}) {\n    await creditLease.release(auth.supabase);`;
      },
    );
  }

  // Insert settle before successful NextResponse.json returns that look like completions.
  if (!src.includes("creditLease.settle")) {
    src = src.replace(
      /(\n)([ \t]*)return NextResponse\.json\(\{/g,
      (match, nl, indent, offset) => {
        const beforeReturn = src.slice(0, offset);
        if (!beforeReturn.includes("creditLease")) return match;
        // Skip if this return is inside a catch block after the last catch keyword closer to us than try
        const window = beforeReturn.slice(-1200);
        const catchIdx = window.lastIndexOf("catch (");
        const tryIdx = window.lastIndexOf("try {");
        if (catchIdx > tryIdx) return match;
        // Skip obvious error payloads
        const after = src.slice(offset, offset + 280);
        if (/status:\s*[45]\d\d/.test(after)) return match;
        if (/error:/.test(after) && !/generation:|project:|result:|ok:\s*true|message:/.test(after)) {
          return match;
        }
        return `${nl}${indent}await creditLease.settle(auth.supabase);${nl}${indent}return NextResponse.json({`;
      },
    );
  }

  if (src !== before) {
    fs.writeFileSync(file, src);
    changed += 1;
    console.log("wired", file);
  } else {
    console.log("unchanged", file);
  }
}

console.log(`wired ${changed} of ${files.length}`);
