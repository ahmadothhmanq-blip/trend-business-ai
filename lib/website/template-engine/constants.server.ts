import path from "node:path";
import { WB_TEMPLATES_RELATIVE_PATH } from "@/lib/website/template-engine/constants";

export function resolveWbTemplatesRoot(cwd: string = process.cwd()): string {
  return path.join(cwd, WB_TEMPLATES_RELATIVE_PATH);
}
