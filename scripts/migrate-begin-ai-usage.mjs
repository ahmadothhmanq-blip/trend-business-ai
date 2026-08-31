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

const skip = new Set([
  path.normalize("app/api/website-builder/route.ts"),
  path.normalize("app/api/website-builder/stream/route.ts"),
]);

const files = walk("app/api").filter((file) => {
  const normalized = path.normalize(file);
  if (skip.has(normalized)) return false;
  return fs.readFileSync(file, "utf8").includes("enforceAiUsage");
});

let changed = 0;
for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;

  src = src.replace(
    /import \{([^}]*)\benforceAiUsage\b([^}]*)\} from "@\/lib\/api\/rate-limit"/g,
    (_m, pre, post) => {
      const names = `${pre} beginAiUsage ${post}`
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .filter((name) => name !== "enforceAiUsage");
      if (!names.includes("beginAiUsage")) names.unshift("beginAiUsage");
      return `import { ${[...new Set(names)].join(", ")} } from "@/lib/api/rate-limit"`;
    },
  );

  src = src.replace(
    /const (\w+) = await enforceAiUsage\(([^;]+)\);\s*\n(\s*)if \(\1\) return \1;/g,
    (_m, _name, args, indent) =>
      `const usage = await beginAiUsage(${args});\n${indent}if (!usage.ok) return usage.response;\n${indent}const creditLease = usage.lease;`,
  );

  src = src.replace(
    /const (\w+) = await beginAiUsage\(([^;]+)\);\s*\n(\s*)if \(\1\) return \1;/g,
    (_m, name, args, indent) => {
      if (name === "usage" && src.includes("creditLease = usage.lease")) return _m;
      return `const usage = await beginAiUsage(${args});\n${indent}if (!usage.ok) return usage.response;\n${indent}const creditLease = usage.lease;`;
    },
  );

  // Leftover identifier references (should be rare after pattern replace)
  if (src.includes("enforceAiUsage")) {
    src = src.replace(/\benforceAiUsage\b/g, "beginAiUsage");
  }

  if (src !== before) {
    fs.writeFileSync(file, src);
    changed += 1;
    console.log("updated", file);
  } else {
    console.log("skip", file);
  }
}

console.log(`changed ${changed} of ${files.length}`);
