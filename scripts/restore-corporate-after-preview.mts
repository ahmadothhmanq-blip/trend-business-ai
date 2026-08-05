import { copyFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const backupDir = path.join(root, "scripts/benchmark-results/visual-reviews/corporate-business/_before-backup");
const compDir = path.join(root, "templates/website/corporate-business/components");

if (!existsSync(backupDir)) {
  console.error("No backup found. Run capture-corporate-before-preview.mts first.");
  process.exit(1);
}

for (const f of readdirSync(backupDir)) {
  copyFileSync(path.join(backupDir, f), path.join(compDir, f));
}

execSync("npx tsx scripts/flagship-template-qa.mts corporate-business --skip-lighthouse", {
  stdio: "inherit",
  cwd: root,
});

console.log("Restored pass-2 components and regenerated preview.");
