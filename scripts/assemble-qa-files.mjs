import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const chunks = [0, 1, 2].map((i) =>
  fs.readFileSync(path.join(root, `qa-chunk-${i}.txt`), "utf8"),
);
const json = chunks.join("");
fs.writeFileSync(path.join(root, "qa-test-corp-files.json"), json);
console.log("assembled", json.length, "bytes");
