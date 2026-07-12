import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const GENERATED_ROOT = path.join(process.cwd(), ".next", "generated-projects");

export function getPreviewProjectDir(previewId: string) {
  return path.join(GENERATED_ROOT, previewId);
}

export async function writePreviewOwner(previewId: string, userId: string) {
  const ownerPath = path.join(getPreviewProjectDir(previewId), ".owner");
  await writeFile(ownerPath, userId, "utf8");
}

export async function verifyPreviewOwner(previewId: string, userId: string) {
  const ownerPath = path.join(getPreviewProjectDir(previewId), ".owner");

  try {
    await access(ownerPath);
  } catch {
    return false;
  }

  const ownerId = (await readFile(ownerPath, "utf8")).trim();
  return ownerId === userId;
}
