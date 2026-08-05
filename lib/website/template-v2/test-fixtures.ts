import path from "node:path";
import { fileURLToPath } from "node:url";

const TEMPLATE_V2_ROOT = path.dirname(fileURLToPath(import.meta.url));

export const SAMPLE_V2_PACKAGE_DIR = path.join(
  TEMPLATE_V2_ROOT,
  "__fixtures__",
  "sample-v2-package",
);

export const SAMPLE_V2_FIXTURES_ROOT = path.join(TEMPLATE_V2_ROOT, "__fixtures__");
